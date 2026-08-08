package com.buildstack.publishing.service.impl;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.publishing.dto.PublishHistoryResponse;
import com.buildstack.publishing.entity.PublishHistory;
import com.buildstack.publishing.entity.WebsiteVersion;
import com.buildstack.publishing.mapper.PublishingMapper;
import com.buildstack.publishing.repository.PublishHistoryRepository;
import com.buildstack.publishing.repository.WebsiteVersionRepository;
import com.buildstack.publishing.service.PublishHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublishHistoryServiceImpl implements PublishHistoryService {

    private final PublishHistoryRepository publishHistoryRepository;
    private final WebsiteVersionRepository websiteVersionRepository;
    private final OrganizationMemberRepository memberRepository;
    private final CurrentUserService currentUserService;
    private final PublishingMapper publishingMapper;

    @Override
    @Transactional(readOnly = true)
    public PublishHistoryResponse getPublishHistory(UUID historyId) {
        PublishHistory history = publishHistoryRepository.findById(historyId)
                .orElseThrow(() -> new ResourceNotFoundException("Publish History not found"));
        verifyMemberAccess(history.getWebsiteVersion().getProject().getWorkspace().getOrganization().getId());
        return publishingMapper.toResponse(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublishHistoryResponse> getPublishHistoriesForVersion(UUID versionId) {
        WebsiteVersion version = websiteVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Website Version not found"));
                
        verifyMemberAccess(version.getProject().getWorkspace().getOrganization().getId());

        return publishHistoryRepository.findByWebsiteVersionIdOrderByPublishedAtDesc(versionId).stream()
                .map(publishingMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }
}
