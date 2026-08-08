package com.buildstack.deployment.service;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.deployment.dto.DeploymentRequest;
import com.buildstack.deployment.dto.DeploymentResponse;
import com.buildstack.deployment.entity.Deployment;
import com.buildstack.deployment.enums.DeploymentStatus;
import com.buildstack.deployment.enums.DeploymentType;
import com.buildstack.deployment.mapper.DeploymentMapper;
import com.buildstack.deployment.repository.DeploymentRepository;
import com.buildstack.generation.service.ArtifactStorageService;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Project;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.publishing.entity.ArtifactMetadata;
import com.buildstack.publishing.entity.PublishHistory;
import com.buildstack.publishing.entity.WebsiteVersion;
import com.buildstack.publishing.enums.PublishResult;
import com.buildstack.publishing.repository.PublishHistoryRepository;
import com.buildstack.publishing.repository.WebsiteVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeploymentOrchestratorServiceTest {

    @Mock
    private DeploymentRepository deploymentRepository;
    @Mock
    private WebsiteVersionRepository websiteVersionRepository;
    @Mock
    private PublishHistoryRepository publishHistoryRepository;
    @Mock
    private OrganizationMemberRepository memberRepository;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private DeploymentMapper deploymentMapper;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private ArtifactStorageService artifactStorageService;

    @InjectMocks
    private DeploymentOrchestratorService orchestratorService;

    private User user;
    private Project project;
    private WebsiteVersion version;
    private ArtifactMetadata artifactMetadata;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        Organization org = new Organization();
        org.setId(UUID.randomUUID());

        Workspace workspace = new Workspace();
        workspace.setId(UUID.randomUUID());
        workspace.setOrganization(org);

        project = new Project();
        project.setId(UUID.randomUUID());
        project.setWorkspace(workspace);

        version = new WebsiteVersion();
        version.setId(UUID.randomUUID());
        version.setProject(project);
        version.setVersionNumber(1);

        PublishHistory history = new PublishHistory();
        history.setResult(PublishResult.SUCCESS);
        history.setWebsiteVersion(version);

        artifactMetadata = new ArtifactMetadata();
        artifactMetadata.setId(UUID.randomUUID());
        artifactMetadata.setPublishHistory(history);
        history.setArtifactMetadata(artifactMetadata);
    }

    @Test
    void requestProductionDeployment_Success() {
        // Arrange
        DeploymentRequest request = new DeploymentRequest(version.getId());
        
        when(websiteVersionRepository.findById(version.getId())).thenReturn(Optional.of(version));
        when(currentUserService.getCurrentUserId()).thenReturn(user.getId());
        
        OrganizationMember member = new OrganizationMember();
        member.setRole(OrganizationRole.ADMIN);
        when(memberRepository.findByOrganizationIdAndUserId(any(), any())).thenReturn(Optional.of(member));
        
        PublishHistory history = artifactMetadata.getPublishHistory();
        when(publishHistoryRepository.findByWebsiteVersionIdOrderByPublishedAtDesc(version.getId()))
                .thenReturn(List.of(history));
                
        when(artifactStorageService.getArtifact(any())).thenReturn(new byte[]{1, 2, 3});
        
        when(currentUserService.getCurrentUser()).thenReturn(user);
        
        // No active deployment initially
        when(deploymentRepository.findByProjectIdAndTypeAndStatus(project.getId(), DeploymentType.PRODUCTION, DeploymentStatus.ACTIVE))
                .thenReturn(Optional.empty());
                
        when(deploymentRepository.save(any(Deployment.class))).thenAnswer(i -> {
            Deployment d = i.getArgument(0);
            if (d.getId() == null) d.setId(UUID.randomUUID());
            return d;
        });

        // Act
        orchestratorService.requestProductionDeployment(request);

        // Assert
        ArgumentCaptor<Deployment> deploymentCaptor = ArgumentCaptor.forClass(Deployment.class);
        verify(deploymentRepository, times(2)).save(deploymentCaptor.capture()); // Once for DEPLOYING, once for ACTIVE
        
        Deployment saved = deploymentCaptor.getValue();
        assertEquals(DeploymentType.PRODUCTION, saved.getType());
        assertEquals(DeploymentStatus.ACTIVE, saved.getStatus());
        assertNotNull(saved.getCompletedAt());
    }
}
