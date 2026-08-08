package com.buildstack.component.service;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.component.dto.BatchPropertyUpdateRequest;
import com.buildstack.component.dto.ComponentMoveRequest;
import com.buildstack.component.dto.ComponentReorderRequest;
import com.buildstack.component.entity.Component;
import com.buildstack.component.mapper.ComponentMapper;
import com.buildstack.component.property.registry.ComponentDefinition;
import com.buildstack.component.property.registry.ComponentRegistry;
import com.buildstack.component.property.validation.PropertyValidator;
import com.buildstack.component.repository.ComponentRepository;
import com.buildstack.component.service.impl.BuilderOperationServiceImpl;
import com.buildstack.exception.BadRequestException;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Page;
import com.buildstack.project.entity.Project;
import com.buildstack.organization.entity.Workspace;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BuilderOperationServiceImplTest {

    @Mock private ComponentRepository componentRepository;
    @Mock private OrganizationMemberRepository memberRepository;
    @Mock private ComponentMapper componentMapper;
    @Mock private CurrentUserService currentUserService;
    @Mock private PropertyValidator propertyValidator;
    @Mock private ComponentRegistry componentRegistry;

    @InjectMocks
    private BuilderOperationServiceImpl builderOperationService;

    private UUID userId;
    private UUID orgId;
    private Component rootComponent;
    private Page page;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        
        Organization org = new Organization();
        org.setId(orgId);
        
        Workspace workspace = new Workspace();
        workspace.setOrganization(org);
        
        Project project = new Project();
        project.setWorkspace(workspace);
        
        page = new Page();
        page.setId(UUID.randomUUID());
        page.setProject(project);

        rootComponent = new Component();
        rootComponent.setId(UUID.randomUUID());
        rootComponent.setPage(page);
        rootComponent.setOrderIndex(0);
        rootComponent.setProps(new HashMap<>());
    }
    
    private void mockAuth() {
        // Setup auth mock
        when(currentUserService.getCurrentUserId()).thenReturn(1L); // using Long in mock? Oh wait, user is Long in this system
        OrganizationMember member = new OrganizationMember();
        member.setRole(OrganizationRole.OWNER);
        when(memberRepository.findByOrganizationIdAndUserId(eq(orgId), any())).thenReturn(Optional.of(member));
    }

    @Test
    void testDuplicateComponent() {
        when(componentRepository.findById(rootComponent.getId())).thenReturn(Optional.of(rootComponent));
        mockAuth();
        
        List<Component> descendants = new ArrayList<>();
        descendants.add(rootComponent);
        when(componentRepository.findAllByPageIdOrderByOrderIndexAsc(page.getId())).thenReturn(descendants);

        builderOperationService.duplicateComponent(rootComponent.getId());
        
        verify(componentRepository).saveAll(any());
        verify(componentMapper).toResponse(any());
    }

    @Test
    void testMoveComponent_CycleDetected() {
        Component child = new Component();
        child.setId(UUID.randomUUID());
        child.setParent(rootComponent);
        child.setPage(page);

        when(componentRepository.findById(rootComponent.getId())).thenReturn(Optional.of(rootComponent));
        when(componentRepository.findById(child.getId())).thenReturn(Optional.of(child));
        mockAuth();

        ComponentMoveRequest req = new ComponentMoveRequest(child.getId(), 0);
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> builderOperationService.moveComponent(rootComponent.getId(), req));
        assertThat(ex.getMessage()).contains("Cycle detected");
    }

    @Test
    void testMoveComponent_Success() {
        Component newParent = new Component();
        newParent.setId(UUID.randomUUID());
        newParent.setPage(page);
        newParent.setOrderIndex(1);

        when(componentRepository.findById(rootComponent.getId())).thenReturn(Optional.of(rootComponent));
        when(componentRepository.findById(newParent.getId())).thenReturn(Optional.of(newParent));
        mockAuth();
        
        ComponentDefinition mockDef = ComponentDefinition.builder().canHaveChildren(true).build();
        when(componentRegistry.getDefinition(any())).thenReturn(mockDef);
        
        List<Component> all = new ArrayList<>();
        all.add(rootComponent);
        all.add(newParent);
        when(componentRepository.findAllByPageIdOrderByOrderIndexAsc(page.getId())).thenReturn(all);

        ComponentMoveRequest req = new ComponentMoveRequest(newParent.getId(), 0);
        builderOperationService.moveComponent(rootComponent.getId(), req);
        
        verify(componentRepository).saveAll(any());
    }

    @Test
    void testReorderComponent_Success() {
        when(componentRepository.findById(rootComponent.getId())).thenReturn(Optional.of(rootComponent));
        mockAuth();

        Component sibling = new Component();
        sibling.setId(UUID.randomUUID());
        sibling.setPage(page);
        sibling.setOrderIndex(1);

        List<Component> all = new ArrayList<>();
        all.add(rootComponent);
        all.add(sibling);
        when(componentRepository.findAllByPageIdOrderByOrderIndexAsc(page.getId())).thenReturn(all);

        ComponentReorderRequest req = new ComponentReorderRequest(1);
        builderOperationService.reorderComponent(rootComponent.getId(), req);

        verify(componentRepository).saveAll(any());
        assertThat(rootComponent.getOrderIndex()).isEqualTo(1);
        assertThat(sibling.getOrderIndex()).isEqualTo(0);
    }
    
    @Test
    void testBatchUpdateProperties() {
        when(componentRepository.findById(rootComponent.getId())).thenReturn(Optional.of(rootComponent));
        mockAuth();
        
        List<BatchPropertyUpdateRequest.ComponentUpdate> updates = List.of(
            new BatchPropertyUpdateRequest.ComponentUpdate(rootComponent.getId(), Map.of("key", "val"))
        );
        BatchPropertyUpdateRequest req = new BatchPropertyUpdateRequest(updates);
        
        builderOperationService.batchUpdateProperties(req);
        
        verify(propertyValidator).validate(any(), any());
        verify(componentRepository).saveAll(any());
    }
}
