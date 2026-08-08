package com.buildstack.organization.service;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.dto.WorkspaceRequest;
import com.buildstack.organization.dto.WorkspaceResponse;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.mapper.WorkspaceMapper;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkspaceServiceTest {

    @Mock
    private WorkspaceRepository workspaceRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private WorkspaceMapper workspaceMapper;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private com.buildstack.asset.service.AssetService assetService;

    @InjectMocks
    private WorkspaceService workspaceService;

    private User testUser;
    private Organization testOrg;
    private Workspace testWorkspace;

    @BeforeEach
    void setUp() {
        testUser = TestFixtures.createTestUser(1L, "test@ws.com");
        testOrg = TestFixtures.createTestOrganization(UUID.randomUUID(), "org", testUser);
        testWorkspace = TestFixtures.createTestWorkspace(UUID.randomUUID(), "KEY1", testOrg);
    }

    @Test
    void shouldCreateWorkspaceSuccessfully() {
        WorkspaceRequest req = new WorkspaceRequest("My WS", "KEY1", "Desc", null, null);
        when(organizationRepository.findById(testOrg.getId())).thenReturn(Optional.of(testOrg));
        when(currentUserService.getCurrentUserId()).thenReturn(testUser.getId());
        when(workspaceRepository.existsByOrganizationIdAndKey(testOrg.getId(), "KEY1")).thenReturn(false);
        
        when(workspaceMapper.toEntity(req)).thenReturn(testWorkspace);
        when(workspaceRepository.save(any(Workspace.class))).thenReturn(testWorkspace);

        WorkspaceResponse resp = new WorkspaceResponse(testWorkspace.getId(), testOrg.getId(), "My WS", "KEY1", "Desc", null, null, false, null, null);
        when(workspaceMapper.toResponse(testWorkspace)).thenReturn(resp);

        WorkspaceResponse result = workspaceService.createWorkspace(testOrg.getId(), req);

        assertThat(result).isNotNull();
        assertThat(result.key()).isEqualTo("KEY1");
        verify(workspaceRepository).save(any(Workspace.class));
    }

    @Test
    void shouldFailCreateWhenKeyExists() {
        WorkspaceRequest req = new WorkspaceRequest("My WS", "KEY1", "Desc", null, null);
        when(organizationRepository.findById(testOrg.getId())).thenReturn(Optional.of(testOrg));
        when(currentUserService.getCurrentUserId()).thenReturn(testUser.getId());
        when(workspaceRepository.existsByOrganizationIdAndKey(testOrg.getId(), "KEY1")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> workspaceService.createWorkspace(testOrg.getId(), req));
    }

    @Test
    void shouldFailCreateWhenUserNotOwner() {
        WorkspaceRequest req = new WorkspaceRequest("My WS", "KEY1", "Desc", null, null);
        when(organizationRepository.findById(testOrg.getId())).thenReturn(Optional.of(testOrg));
        when(currentUserService.getCurrentUserId()).thenReturn(999L);

        assertThrows(AccessDeniedException.class, () -> workspaceService.createWorkspace(testOrg.getId(), req));
    }

    @Test
    void shouldArchiveWorkspaceSuccessfully() {
        when(workspaceRepository.findById(testWorkspace.getId())).thenReturn(Optional.of(testWorkspace));
        when(currentUserService.getCurrentUserId()).thenReturn(testUser.getId());
        when(workspaceRepository.save(any(Workspace.class))).thenReturn(testWorkspace);

        WorkspaceResponse resp = new WorkspaceResponse(testWorkspace.getId(), testOrg.getId(), "My WS", "KEY1", "Desc", null, null, true, null, null);
        when(workspaceMapper.toResponse(testWorkspace)).thenReturn(resp);

        WorkspaceResponse result = workspaceService.archiveWorkspace(testWorkspace.getId());

        assertThat(result.archived()).isTrue();
        assertThat(testWorkspace.isArchived()).isTrue();
        verify(workspaceRepository).save(testWorkspace);
    }
}
