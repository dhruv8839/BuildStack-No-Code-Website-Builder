package com.buildstack.component.service;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.dto.ComponentUpdateRequest;
import com.buildstack.component.entity.Component;
import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.mapper.ComponentMapper;
import com.buildstack.component.repository.ComponentRepository;
import com.buildstack.component.service.impl.ComponentServiceImpl;
import com.buildstack.exception.BadRequestException;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Page;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.PageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComponentServiceTest {

    @Mock
    private ComponentRepository componentRepository;
    @Mock
    private PageRepository pageRepository;
    @Mock
    private OrganizationMemberRepository memberRepository;
    @Mock
    private ComponentMapper componentMapper;
    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ComponentServiceImpl componentService;

    private UUID pageId;
    private Page page;

    @BeforeEach
    void setUp() {
        pageId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        Long userId = 1L;

        Organization org = new Organization();
        org.setId(orgId);

        Workspace ws = new Workspace();
        ws.setOrganization(org);

        Project project = new Project();
        project.setWorkspace(ws);

        page = new Page();
        page.setId(pageId);
        page.setProject(project);

        OrganizationMember member = new OrganizationMember();
        member.setRole(OrganizationRole.ADMIN);

        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(memberRepository.findByOrganizationIdAndUserId(orgId, userId)).thenReturn(Optional.of(member));
    }

    @Test
    void shouldDetectCycleWhenUpdatingParent() {
        UUID rootId = UUID.randomUUID();
        Component root = new Component();
        root.setId(rootId);
        root.setPage(page);

        UUID childId = UUID.randomUUID();
        Component child = new Component();
        child.setId(childId);
        child.setPage(page);
        child.setParent(root);

        // Attempt to move root under its own child
        ComponentUpdateRequest request = new ComponentUpdateRequest(childId, new HashMap<>(), 0);

        when(componentRepository.findById(rootId)).thenReturn(Optional.of(root));
        when(componentRepository.findById(childId)).thenReturn(Optional.of(child));

        assertThrows(BadRequestException.class, () -> componentService.updateComponent(rootId, request));
    }

    @Test
    void shouldCreateComponent() {
        ComponentCreateRequest request = new ComponentCreateRequest(null, ComponentType.CONTAINER, new HashMap<>(), 0);

        when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));
        when(componentMapper.toEntity(request)).thenReturn(new Component());
        
        Component saved = new Component();
        saved.setId(UUID.randomUUID());
        when(componentRepository.save(any())).thenReturn(saved);

        ComponentResponse expected = new ComponentResponse(saved.getId(), pageId, null, ComponentType.CONTAINER, new HashMap<>(), 0, null, null);
        when(componentMapper.toResponse(any())).thenReturn(expected);

        ComponentResponse result = componentService.createComponent(pageId, request);
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(saved.getId());
    }

    @Mock
    private com.buildstack.component.property.validation.PropertyValidator propertyValidator;

    @Test
    void shouldMergeProperties() {
        UUID componentId = UUID.randomUUID();
        Component component = new Component();
        component.setId(componentId);
        component.setPage(page);
        component.setType(ComponentType.BUTTON);
        
        Map<String, Object> existingProps = new HashMap<>();
        existingProps.put("text", "Old Text");
        component.setProps(existingProps);
        
        Map<String, Object> patchProps = new HashMap<>();
        patchProps.put("size", "lg");
        
        com.buildstack.component.dto.ComponentPropertyUpdateRequest request = new com.buildstack.component.dto.ComponentPropertyUpdateRequest(patchProps);
        
        when(componentRepository.findById(componentId)).thenReturn(Optional.of(component));
        
        com.buildstack.component.dto.ComponentPropertyResponse response = componentService.mergeProperties(componentId, request);
        
        assertThat(response.props()).containsEntry("text", "Old Text").containsEntry("size", "lg");
        org.mockito.Mockito.verify(propertyValidator).validate(org.mockito.ArgumentMatchers.eq(ComponentType.BUTTON), org.mockito.ArgumentMatchers.anyMap());
        org.mockito.Mockito.verify(componentRepository).save(component);
    }
    
    @Test
    void shouldReplaceProperties() {
        UUID componentId = UUID.randomUUID();
        Component component = new Component();
        component.setId(componentId);
        component.setPage(page);
        component.setType(ComponentType.BUTTON);
        
        Map<String, Object> existingProps = new HashMap<>();
        existingProps.put("text", "Old Text");
        component.setProps(existingProps);
        
        Map<String, Object> newProps = new HashMap<>();
        newProps.put("text", "New Text");
        
        com.buildstack.component.dto.ComponentPropertyUpdateRequest request = new com.buildstack.component.dto.ComponentPropertyUpdateRequest(newProps);
        
        when(componentRepository.findById(componentId)).thenReturn(Optional.of(component));
        
        com.buildstack.component.dto.ComponentPropertyResponse response = componentService.replaceProperties(componentId, request);
        
        assertThat(response.props()).containsEntry("text", "New Text").doesNotContainEntry("size", "lg");
        org.mockito.Mockito.verify(propertyValidator).validate(org.mockito.ArgumentMatchers.eq(ComponentType.BUTTON), org.mockito.ArgumentMatchers.anyMap());
        org.mockito.Mockito.verify(componentRepository).save(component);
    }
}
