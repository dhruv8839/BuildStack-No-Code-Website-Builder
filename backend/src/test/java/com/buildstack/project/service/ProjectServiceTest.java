package com.buildstack.project.service;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.project.dto.ProjectCreateRequest;
import com.buildstack.project.dto.ProjectResponse;
import com.buildstack.project.dto.ProjectUpdateRequest;
import com.buildstack.project.entity.Project;
import com.buildstack.project.enums.ProjectStatus;
import com.buildstack.project.mapper.ProjectMapper;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.project.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private ProjectMapper projectMapper;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private UUID workspaceId;
    private UUID orgId;
    private Long userId;
    private Workspace workspace;
    private Organization organization;
    private OrganizationMember member;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        userId = 1L;

        organization = new Organization();
        organization.setId(orgId);

        workspace = new Workspace();
        workspace.setId(workspaceId);
        workspace.setOrganization(organization);

        member = new OrganizationMember();
        member.setRole(OrganizationRole.ADMIN);
    }

    @Test
    void createProject_shouldCreateSuccessfully() {
        ProjectCreateRequest request = new ProjectCreateRequest("My Site", "my-site", "Desc", workspaceId);
        
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(memberRepository.findByOrganizationIdAndUserId(orgId, userId)).thenReturn(Optional.of(member));
        when(projectRepository.existsByWorkspaceIdAndSlug(workspaceId, "my-site")).thenReturn(false);

        Project project = new Project();
        when(projectMapper.toEntity(request)).thenReturn(project);
        
        Project savedProject = new Project();
        savedProject.setId(UUID.randomUUID());
        when(projectRepository.save(any(Project.class))).thenReturn(savedProject);
        
        ProjectResponse response = new ProjectResponse(UUID.randomUUID(), "My Site", "my-site", "Desc", null, ProjectStatus.DRAFT, workspaceId, null, null);
        when(projectMapper.toResponse(savedProject)).thenReturn(response);

        ProjectResponse result = projectService.createProject(request);

        assertThat(result).isNotNull();
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void createProject_shouldFailWhenNotAdminOrOwner() {
        ProjectCreateRequest request = new ProjectCreateRequest("My Site", "my-site", "Desc", workspaceId);
        
        member.setRole(OrganizationRole.MEMBER);
        
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(memberRepository.findByOrganizationIdAndUserId(orgId, userId)).thenReturn(Optional.of(member));

        assertThrows(AccessDeniedException.class, () -> projectService.createProject(request));
        verify(projectRepository, never()).save(any(Project.class));
    }
}
