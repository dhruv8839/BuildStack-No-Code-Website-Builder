package com.buildstack.generation.service;

import com.buildstack.deployment.entity.Deployment;
import com.buildstack.deployment.enums.DeploymentStatus;
import com.buildstack.deployment.repository.DeploymentRepository;
import com.buildstack.domain.event.ArtifactRetentionCompletedEvent;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.publishing.entity.ArtifactMetadata;
import com.buildstack.publishing.repository.ArtifactMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArtifactRetentionService {

    private final ProjectRepository projectRepository;
    private final ArtifactMetadataRepository artifactMetadataRepository;
    private final DeploymentRepository deploymentRepository;
    private final ArtifactStorageService artifactStorageService;
    private final ApplicationEventPublisher eventPublisher;

    private static final int RETAIN_LATEST_N = 5;

    @Scheduled(fixedRate = 86400000) // Run daily
    @Transactional
    public void executeRetentionPolicy() {
        log.info("Starting Artifact Retention Policy Execution");
        List<Project> projects = projectRepository.findAll();
        
        for (Project project : projects) {
            try {
                cleanupProjectArtifacts(project.getId());
            } catch (Exception ex) {
                log.error("Failed to cleanup artifacts for project: {}", project.getId(), ex);
            }
        }
        log.info("Finished Artifact Retention Policy Execution");
    }
    
    @Transactional
    public void cleanupProjectArtifacts(UUID projectId) {
        // 1. Get all artifacts for the project sorted by newest first
        List<ArtifactMetadata> allArtifacts = artifactMetadataRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        
        if (allArtifacts.size() <= RETAIN_LATEST_N) {
            return; // Not enough artifacts to require cleanup
        }
        
        // 2. Identify artifacts to retain
        Set<UUID> artifactsToRetain = allArtifacts.stream()
                .limit(RETAIN_LATEST_N)
                .map(ArtifactMetadata::getId)
                .collect(Collectors.toSet());
                
        // Add ACTIVE deployments
        List<Deployment> activeDeployments = deploymentRepository.findByProjectIdOrderByStartedAtDesc(projectId).stream()
                .filter(d -> d.getStatus() == DeploymentStatus.ACTIVE)
                .toList();
                
        activeDeployments.forEach(d -> artifactsToRetain.add(d.getArtifactMetadata().getId()));
        
        // Add ROLLED_BACK deployments (we might want to keep the history of what was rolled back)
        List<Deployment> rolledBackDeployments = deploymentRepository.findByProjectIdOrderByStartedAtDesc(projectId).stream()
                .filter(d -> d.getStatus() == DeploymentStatus.ROLLED_BACK)
                .toList();
                
        rolledBackDeployments.forEach(d -> artifactsToRetain.add(d.getArtifactMetadata().getId()));

        int deletedCount = 0;
        
        // 3. Delete obsolete artifacts
        for (ArtifactMetadata artifact : allArtifacts) {
            if (!artifactsToRetain.contains(artifact.getId())) {
                String storageKey = artifact.getPublishHistory().getWebsiteVersion().getId().toString() + "/site.zip";
                try {
                    artifactStorageService.deleteArtifact(storageKey);
                    artifactMetadataRepository.delete(artifact);
                    deletedCount++;
                    log.info("Deleted obsolete artifact: {}", artifact.getId());
                } catch (Exception ex) {
                    log.warn("Failed to delete artifact: {}", artifact.getId(), ex);
                }
            }
        }
        
        if (deletedCount > 0) {
            eventPublisher.publishEvent(new ArtifactRetentionCompletedEvent(projectId, deletedCount));
        }
    }
}
