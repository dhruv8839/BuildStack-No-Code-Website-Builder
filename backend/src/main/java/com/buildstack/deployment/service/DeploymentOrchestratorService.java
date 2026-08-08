package com.buildstack.deployment.service;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.deployment.dto.DeploymentRequest;
import com.buildstack.deployment.dto.DeploymentResponse;
import com.buildstack.deployment.entity.Deployment;
import com.buildstack.deployment.enums.DeploymentStatus;
import com.buildstack.deployment.enums.DeploymentType;
import com.buildstack.deployment.event.DeploymentCompletedEvent;
import com.buildstack.deployment.event.DeploymentFailedEvent;
import com.buildstack.deployment.event.DeploymentStartedEvent;
import com.buildstack.deployment.event.RollbackCompletedEvent;
import com.buildstack.deployment.exception.DeploymentException;
import com.buildstack.deployment.mapper.DeploymentMapper;
import com.buildstack.deployment.repository.DeploymentRepository;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Project;
import com.buildstack.publishing.entity.ArtifactMetadata;
import com.buildstack.publishing.entity.PublishHistory;
import com.buildstack.publishing.entity.WebsiteVersion;
import com.buildstack.publishing.enums.PublishResult;
import com.buildstack.publishing.repository.PublishHistoryRepository;
import com.buildstack.publishing.repository.WebsiteVersionRepository;
import com.buildstack.generation.service.ArtifactStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentOrchestratorService {

    private final DeploymentRepository deploymentRepository;
    private final WebsiteVersionRepository websiteVersionRepository;
    private final PublishHistoryRepository publishHistoryRepository;
    private final OrganizationMemberRepository memberRepository;
    private final CurrentUserService currentUserService;
    private final DeploymentMapper deploymentMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final ArtifactStorageService artifactStorageService;

    @Transactional
    public DeploymentResponse requestPreviewDeployment(DeploymentRequest request) {
        WebsiteVersion version = getVersion(request.websiteVersionId());
        verifyMemberAccess(version.getProject().getWorkspace().getOrganization().getId());

        ArtifactMetadata metadata = getArtifactMetadataForVersion(version);
        validateArtifactIntegrity(metadata);

        User currentUser = currentUserService.getCurrentUser();

        Deployment deployment = new Deployment();
        deployment.setProject(version.getProject());
        deployment.setWebsiteVersion(version);
        deployment.setArtifactMetadata(metadata);
        deployment.setType(DeploymentType.PREVIEW);
        deployment.setStatus(DeploymentStatus.ACTIVE);
        deployment.setDeployedBy(currentUser);
        deployment.setMessage("Preview deployment for version " + version.getVersionNumber());
        deployment.setStartedAt(Instant.now());
        deployment.setCompletedAt(Instant.now());
        deployment.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS)); // Expires in 24 hours

        deployment = deploymentRepository.save(deployment);
        eventPublisher.publishEvent(new DeploymentCompletedEvent(deployment.getId(), version.getProject().getId(), version.getId()));

        return deploymentMapper.toResponse(deployment);
    }

    @Transactional
    public DeploymentResponse requestProductionDeployment(DeploymentRequest request) {
        WebsiteVersion version = getVersion(request.websiteVersionId());
        verifyAdminAccess(version.getProject().getWorkspace().getOrganization().getId());

        ArtifactMetadata metadata = getArtifactMetadataForVersion(version);
        validateArtifactIntegrity(metadata);

        User currentUser = currentUserService.getCurrentUser();

        // Atomic Deactivation of Old Deployment
        Optional<Deployment> activeDeployment = deploymentRepository.findByProjectIdAndTypeAndStatus(
                version.getProject().getId(), DeploymentType.PRODUCTION, DeploymentStatus.ACTIVE);

        Deployment deployment = new Deployment();
        deployment.setProject(version.getProject());
        deployment.setWebsiteVersion(version);
        deployment.setArtifactMetadata(metadata);
        deployment.setType(DeploymentType.PRODUCTION);
        deployment.setStatus(DeploymentStatus.DEPLOYING);
        deployment.setDeployedBy(currentUser);
        deployment.setMessage("Production deployment for version " + version.getVersionNumber());
        deployment = deploymentRepository.save(deployment);

        eventPublisher.publishEvent(new DeploymentStartedEvent(deployment.getId(), version.getProject().getId(), version.getId()));

        try {
            // "Atomic" switch - if this fails, transaction rolls back and previous remains ACTIVE
            activeDeployment.ifPresent(old -> {
                old.setStatus(DeploymentStatus.EXPIRED);
                old.setCompletedAt(Instant.now());
                deploymentRepository.save(old);
            });

            deployment.setStatus(DeploymentStatus.ACTIVE);
            deployment.setCompletedAt(Instant.now());
            deployment = deploymentRepository.save(deployment);

            eventPublisher.publishEvent(new DeploymentCompletedEvent(deployment.getId(), version.getProject().getId(), version.getId()));
            return deploymentMapper.toResponse(deployment);

        } catch (Exception ex) {
            log.error("Deployment failed", ex);
            deployment.setStatus(DeploymentStatus.FAILED);
            deployment.setCompletedAt(Instant.now());
            deploymentRepository.save(deployment);
            
            eventPublisher.publishEvent(new DeploymentFailedEvent(deployment.getId(), version.getProject().getId(), ex.getMessage()));
            throw new DeploymentException("Failed to activate deployment: " + ex.getMessage());
        }
    }

    @Transactional
    public DeploymentResponse rollbackProduction(UUID previousDeploymentId) {
        Deployment previousDeployment = deploymentRepository.findById(previousDeploymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found"));

        if (previousDeployment.getType() != DeploymentType.PRODUCTION) {
            throw new DeploymentException("Only production deployments can be rolled back.");
        }

        Project project = previousDeployment.getProject();
        verifyAdminAccess(project.getWorkspace().getOrganization().getId());

        User currentUser = currentUserService.getCurrentUser();

        Optional<Deployment> activeDeployment = deploymentRepository.findByProjectIdAndTypeAndStatus(
                project.getId(), DeploymentType.PRODUCTION, DeploymentStatus.ACTIVE);

        if (activeDeployment.isPresent() && activeDeployment.get().getId().equals(previousDeployment.getId())) {
            throw new DeploymentException("Deployment is already active.");
        }

        // Validate integrity of the old artifact before rolling back
        validateArtifactIntegrity(previousDeployment.getArtifactMetadata());

        // Create new Deployment record pointing to the old artifact
        Deployment rollbackDeployment = new Deployment();
        rollbackDeployment.setProject(project);
        rollbackDeployment.setWebsiteVersion(previousDeployment.getWebsiteVersion());
        rollbackDeployment.setArtifactMetadata(previousDeployment.getArtifactMetadata());
        rollbackDeployment.setType(DeploymentType.PRODUCTION);
        rollbackDeployment.setStatus(DeploymentStatus.DEPLOYING);
        rollbackDeployment.setDeployedBy(currentUser);
        rollbackDeployment.setMessage("Rollback to deployment " + previousDeployment.getId());
        rollbackDeployment = deploymentRepository.save(rollbackDeployment);

        eventPublisher.publishEvent(new DeploymentStartedEvent(rollbackDeployment.getId(), project.getId(), rollbackDeployment.getWebsiteVersion().getId()));

        try {
            activeDeployment.ifPresent(active -> {
                active.setStatus(DeploymentStatus.ROLLED_BACK); // The one we rolled back *from* becomes ROLLED_BACK
                active.setCompletedAt(Instant.now());
                deploymentRepository.save(active);
            });

            rollbackDeployment.setStatus(DeploymentStatus.ACTIVE);
            rollbackDeployment.setCompletedAt(Instant.now());
            rollbackDeployment = deploymentRepository.save(rollbackDeployment);

            eventPublisher.publishEvent(new RollbackCompletedEvent(rollbackDeployment.getId(), previousDeployment.getId(), project.getId()));
            return deploymentMapper.toResponse(rollbackDeployment);

        } catch (Exception ex) {
            log.error("Rollback failed", ex);
            rollbackDeployment.setStatus(DeploymentStatus.FAILED);
            rollbackDeployment.setCompletedAt(Instant.now());
            deploymentRepository.save(rollbackDeployment);
            throw new DeploymentException("Failed to execute rollback: " + ex.getMessage());
        }
    }

    private void validateArtifactIntegrity(ArtifactMetadata metadata) {
        if (metadata == null) {
            throw new DeploymentException("Artifact metadata is missing.");
        }
        
        try {
            // Read artifact using the ArtifactStorageService from Increment 13
            // to ensure it exists and we can access it. In a real system, we might compute the SHA-256 again.
            // For now, ensuring it exists is our "integrity check" as requested.
            String storageKey = metadata.getPublishHistory().getWebsiteVersion().getId().toString() + "/site.zip";
            byte[] artifactData = artifactStorageService.getArtifact(storageKey);
            if (artifactData == null || artifactData.length == 0) {
                throw new DeploymentException("Artifact payload is empty or missing from storage.");
            }
        } catch (Exception ex) {
            throw new DeploymentException("Artifact validation failed: " + ex.getMessage());
        }
    }

    private WebsiteVersion getVersion(UUID versionId) {
        return websiteVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Website version not found"));
    }

    private ArtifactMetadata getArtifactMetadataForVersion(WebsiteVersion version) {
        List<PublishHistory> history = publishHistoryRepository.findByWebsiteVersionIdOrderByPublishedAtDesc(version.getId());
        return history.stream()
                .filter(h -> h.getResult() == PublishResult.SUCCESS && h.getArtifactMetadata() != null)
                .map(PublishHistory::getArtifactMetadata)
                .findFirst()
                .orElseThrow(() -> new DeploymentException("No valid generated artifact found for this version."));
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to trigger deployments.");
        }
    }

    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }
}
