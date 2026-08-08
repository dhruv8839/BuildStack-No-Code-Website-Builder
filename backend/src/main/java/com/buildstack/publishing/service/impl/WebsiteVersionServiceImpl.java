package com.buildstack.publishing.service.impl;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.publishing.dto.WebsiteVersionCreateRequest;
import com.buildstack.publishing.dto.WebsiteVersionResponse;
import com.buildstack.publishing.entity.WebsiteVersion;
import com.buildstack.publishing.enums.WebsiteVersionStatus;
import com.buildstack.publishing.event.VersionCreatedEvent;
import com.buildstack.publishing.mapper.PublishingMapper;
import com.buildstack.publishing.repository.WebsiteVersionRepository;
import com.buildstack.publishing.service.WebsiteVersionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WebsiteVersionServiceImpl implements WebsiteVersionService {

    private final WebsiteVersionRepository websiteVersionRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final CurrentUserService currentUserService;
    private final PublishingMapper publishingMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public WebsiteVersionResponse createVersion(WebsiteVersionCreateRequest request) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.projectId()));

        verifyAdminAccess(project.getWorkspace().getOrganization().getId());
        User currentUser = currentUserService.getCurrentUser();

        Integer nextVersion = websiteVersionRepository.findTopByProjectIdOrderByVersionNumberDesc(project.getId())
                .map(v -> v.getVersionNumber() + 1)
                .orElse(1);

        WebsiteVersion version = new WebsiteVersion();
        version.setProject(project);
        version.setVersionNumber(nextVersion);
        version.setStatus(WebsiteVersionStatus.DRAFT);
        version.setCreatedBy(currentUser);

        version = websiteVersionRepository.save(version);
        eventPublisher.publishEvent(new VersionCreatedEvent(version.getId(), project.getId(), currentUser.getId()));

        return publishingMapper.toResponse(version);
    }

    @Override
    @Transactional(readOnly = true)
    public WebsiteVersionResponse getVersion(UUID versionId) {
        WebsiteVersion version = findVersionOrThrow(versionId);
        verifyMemberAccess(version.getProject().getWorkspace().getOrganization().getId());
        return publishingMapper.toResponse(version);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WebsiteVersionResponse> getVersionsByProject(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        
        verifyMemberAccess(project.getWorkspace().getOrganization().getId());

        return websiteVersionRepository.findByProjectIdOrderByVersionNumberDesc(projectId).stream()
                .map(publishingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WebsiteVersionResponse updateVersionStatus(UUID versionId, WebsiteVersionStatus newStatus) {
        WebsiteVersion version = findVersionOrThrow(versionId);
        verifyAdminAccess(version.getProject().getWorkspace().getOrganization().getId());
        
        version.setStatus(newStatus);
        version = websiteVersionRepository.save(version);
        
        return publishingMapper.toResponse(version);
    }

    @Override
    @Transactional
    public void archiveVersion(UUID versionId) {
        WebsiteVersion version = findVersionOrThrow(versionId);
        verifyAdminAccess(version.getProject().getWorkspace().getOrganization().getId());
        
        version.setStatus(WebsiteVersionStatus.ARCHIVED);
        websiteVersionRepository.save(version);
    }
    
    private WebsiteVersion findVersionOrThrow(UUID id) {
        return websiteVersionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Website Version not found with id: " + id));
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to manage versions in this organization.");
        }
    }

    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }
}
