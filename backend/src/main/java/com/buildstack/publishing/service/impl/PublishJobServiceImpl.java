package com.buildstack.publishing.service.impl;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.publishing.dto.PublishJobResponse;
import com.buildstack.publishing.dto.PublishRequest;
import com.buildstack.publishing.entity.PublishJob;
import com.buildstack.publishing.entity.WebsiteVersion;
import com.buildstack.publishing.enums.PublishJobStatus;
import com.buildstack.publishing.event.PublishStartedEvent;
import com.buildstack.publishing.mapper.PublishingMapper;
import com.buildstack.publishing.repository.PublishJobRepository;
import com.buildstack.publishing.repository.WebsiteVersionRepository;
import com.buildstack.publishing.service.PublishJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublishJobServiceImpl implements PublishJobService {

    private final PublishJobRepository publishJobRepository;
    private final WebsiteVersionRepository websiteVersionRepository;
    private final OrganizationMemberRepository memberRepository;
    private final CurrentUserService currentUserService;
    private final PublishingMapper publishingMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public PublishJobResponse requestPublish(PublishRequest request) {
        WebsiteVersion version = websiteVersionRepository.findById(request.websiteVersionId())
                .orElseThrow(() -> new ResourceNotFoundException("Website Version not found"));

        verifyAdminAccess(version.getProject().getWorkspace().getOrganization().getId());
        
        List<PublishJob> existingJobs = publishJobRepository.findByWebsiteVersionIdOrderByStartedAtDesc(version.getId());
        if (existingJobs.stream().anyMatch(j -> j.getStatus() != PublishJobStatus.SUCCESS && j.getStatus() != PublishJobStatus.FAILED)) {
            throw new BadRequestException("A publish job is already active for this version.");
        }

        User currentUser = currentUserService.getCurrentUser();

        PublishJob job = new PublishJob();
        job.setWebsiteVersion(version);
        job.setStatus(PublishJobStatus.QUEUED);
        job.setTriggeredBy(currentUser);
        job.setStartedAt(Instant.now());

        job = publishJobRepository.save(job);
        eventPublisher.publishEvent(new PublishStartedEvent(job.getId(), version.getId(), currentUser.getId()));

        return publishingMapper.toResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public PublishJobResponse getPublishJob(UUID jobId) {
        PublishJob job = publishJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Publish Job not found"));
        verifyMemberAccess(job.getWebsiteVersion().getProject().getWorkspace().getOrganization().getId());
        return publishingMapper.toResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublishJobResponse> getPublishJobsForVersion(UUID versionId) {
        WebsiteVersion version = websiteVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Website Version not found"));
                
        verifyMemberAccess(version.getProject().getWorkspace().getOrganization().getId());

        return publishJobRepository.findByWebsiteVersionIdOrderByStartedAtDesc(versionId).stream()
                .map(publishingMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to trigger publishing in this organization.");
        }
    }

    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }
}
