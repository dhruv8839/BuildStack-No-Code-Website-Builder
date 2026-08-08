package com.buildstack.publishing.service;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.publishing.dto.WebsiteVersionCreateRequest;
import com.buildstack.publishing.dto.WebsiteVersionResponse;
import com.buildstack.publishing.entity.WebsiteVersion;
import com.buildstack.publishing.enums.WebsiteVersionStatus;
import com.buildstack.publishing.mapper.PublishingMapper;
import com.buildstack.publishing.repository.WebsiteVersionRepository;
import com.buildstack.publishing.service.impl.WebsiteVersionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebsiteVersionServiceTest {

    @Mock private WebsiteVersionRepository websiteVersionRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private OrganizationMemberRepository memberRepository;
    @Mock private CurrentUserService currentUserService;
    @Mock private PublishingMapper publishingMapper;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private WebsiteVersionServiceImpl websiteVersionService;

    private User user;
    private Project project;
    private Organization organization;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);

        organization = new Organization();
        organization.setId(UUID.randomUUID());

        Workspace workspace = new Workspace();
        workspace.setId(UUID.randomUUID());
        workspace.setOrganization(organization);

        project = new Project();
        project.setId(UUID.randomUUID());
        project.setWorkspace(workspace);
    }

    @Test
    void createVersion_Success() {
        WebsiteVersionCreateRequest request = new WebsiteVersionCreateRequest(project.getId());
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(currentUserService.getCurrentUserId()).thenReturn(user.getId());
        when(currentUserService.getCurrentUser()).thenReturn(user);

        OrganizationMember member = new OrganizationMember();
        member.setRole(OrganizationRole.ADMIN);
        when(memberRepository.findByOrganizationIdAndUserId(organization.getId(), user.getId()))
                .thenReturn(Optional.of(member));

        when(websiteVersionRepository.findTopByProjectIdOrderByVersionNumberDesc(project.getId()))
                .thenReturn(Optional.empty());

        WebsiteVersion savedVersion = new WebsiteVersion();
        savedVersion.setId(UUID.randomUUID());
        savedVersion.setVersionNumber(1);
        savedVersion.setStatus(WebsiteVersionStatus.DRAFT);
        when(websiteVersionRepository.save(any(WebsiteVersion.class))).thenReturn(savedVersion);

        WebsiteVersionResponse mockResponse = new WebsiteVersionResponse(savedVersion.getId(), project.getId(), 1, WebsiteVersionStatus.DRAFT, user.getId(), null, null);
        when(publishingMapper.toResponse(any(WebsiteVersion.class))).thenReturn(mockResponse);

        WebsiteVersionResponse response = websiteVersionService.createVersion(request);

        assertNotNull(response);
        assertEquals(1, response.versionNumber());
        assertEquals(WebsiteVersionStatus.DRAFT, response.status());
        verify(websiteVersionRepository).save(any(WebsiteVersion.class));
        verify(eventPublisher).publishEvent(any(Object.class));
    }

    @Test
    void createVersion_ThrowsAccessDenied_WhenNotAdmin() {
        WebsiteVersionCreateRequest request = new WebsiteVersionCreateRequest(project.getId());
        
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(currentUserService.getCurrentUserId()).thenReturn(user.getId());

        OrganizationMember member = new OrganizationMember();
        member.setRole(OrganizationRole.MEMBER); // Not ADMIN
        when(memberRepository.findByOrganizationIdAndUserId(organization.getId(), user.getId()))
                .thenReturn(Optional.of(member));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> websiteVersionService.createVersion(request));
        
        verify(websiteVersionRepository, never()).save(any());
    }

    @Test
    void getVersion_Success() {
        UUID versionId = UUID.randomUUID();
        WebsiteVersion version = new WebsiteVersion();
        version.setId(versionId);
        version.setProject(project);

        when(websiteVersionRepository.findById(versionId)).thenReturn(Optional.of(version));
        when(currentUserService.getCurrentUserId()).thenReturn(user.getId());
        when(memberRepository.existsByOrganizationIdAndUserId(organization.getId(), user.getId())).thenReturn(true);
        
        WebsiteVersionResponse mockResponse = new WebsiteVersionResponse(versionId, project.getId(), 1, WebsiteVersionStatus.DRAFT, user.getId(), null, null);
        when(publishingMapper.toResponse(version)).thenReturn(mockResponse);

        WebsiteVersionResponse response = websiteVersionService.getVersion(versionId);

        assertNotNull(response);
        verify(publishingMapper).toResponse(version);
    }
}
