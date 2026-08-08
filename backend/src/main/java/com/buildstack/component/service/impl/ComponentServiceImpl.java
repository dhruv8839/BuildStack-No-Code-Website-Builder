package com.buildstack.component.service.impl;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.dto.ComponentUpdateRequest;
import com.buildstack.component.entity.Component;
import com.buildstack.component.mapper.ComponentMapper;
import com.buildstack.component.repository.ComponentRepository;
import com.buildstack.component.service.ComponentService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Page;
import com.buildstack.project.repository.PageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import com.buildstack.component.property.validation.PropertyValidator;
import com.buildstack.component.property.util.JsonMergeUtil;
import com.buildstack.component.dto.ComponentPropertyUpdateRequest;
import com.buildstack.component.dto.ComponentPropertyResponse;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComponentServiceImpl implements ComponentService {

    private final ComponentRepository componentRepository;
    private final PageRepository pageRepository;
    private final OrganizationMemberRepository memberRepository;
    private final ComponentMapper componentMapper;
    private final CurrentUserService currentUserService;
    private final PropertyValidator propertyValidator;

    @Override
    @Transactional
    public ComponentResponse createComponent(UUID pageId, ComponentCreateRequest request) {
        Page page = pageRepository.findById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with id: " + pageId));

        verifyAdminAccess(page.getProject().getWorkspace().getOrganization().getId());

        Component parent = null;
        if (request.parentId() != null) {
            parent = findComponentOrThrow(request.parentId());
            if (!parent.getPage().getId().equals(pageId)) {
                throw new BadRequestException("Parent component does not belong to the same page.");
            }
        }

        Component component = componentMapper.toEntity(request);
        component.setPage(page);
        component.setParent(parent);

        Component saved = componentRepository.save(component);
        return componentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ComponentResponse getComponentById(UUID componentId) {
        Component component = findComponentOrThrow(componentId);
        verifyMemberAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());
        return componentMapper.toResponse(component);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComponentResponse> getAllComponentsForPage(UUID pageId) {
        Page page = pageRepository.findById(pageId)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with id: " + pageId));

        verifyMemberAccess(page.getProject().getWorkspace().getOrganization().getId());

        return componentRepository.findAllByPageIdOrderByOrderIndexAsc(pageId).stream()
                .map(componentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ComponentResponse updateComponent(UUID componentId, ComponentUpdateRequest request) {
        Component component = findComponentOrThrow(componentId);
        verifyAdminAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());

        Component newParent = null;
        if (request.parentId() != null) {
            if (request.parentId().equals(componentId)) {
                throw new BadRequestException("A component cannot be its own parent.");
            }
            newParent = findComponentOrThrow(request.parentId());
            
            if (!newParent.getPage().getId().equals(component.getPage().getId())) {
                throw new BadRequestException("New parent component does not belong to the same page.");
            }
            
            validateNoCycle(component, newParent);
        }

        componentMapper.updateEntityFromRequest(request, component);
        component.setParent(newParent);

        Component updated = componentRepository.save(component);
        return componentMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteComponent(UUID componentId) {
        Component component = findComponentOrThrow(componentId);
        verifyAdminAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());
        componentRepository.delete(component);
    }

    @Override
    @Transactional
    public ComponentPropertyResponse mergeProperties(UUID componentId, ComponentPropertyUpdateRequest request) {
        Component component = findComponentOrThrow(componentId);
        verifyAdminAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());

        Map<String, Object> mergedProps = JsonMergeUtil.merge(component.getProps(), request.props());
        propertyValidator.validate(component.getType(), mergedProps);

        component.setProps(mergedProps);
        componentRepository.save(component);

        return new ComponentPropertyResponse(componentId, mergedProps);
    }

    @Override
    @Transactional
    public ComponentPropertyResponse replaceProperties(UUID componentId, ComponentPropertyUpdateRequest request) {
        Component component = findComponentOrThrow(componentId);
        verifyAdminAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());

        Map<String, Object> newProps = request.props() != null ? new HashMap<>(request.props()) : new HashMap<>();
        propertyValidator.validate(component.getType(), newProps);

        component.setProps(newProps);
        componentRepository.save(component);

        return new ComponentPropertyResponse(componentId, newProps);
    }

    private void validateNoCycle(Component componentToMove, Component targetParent) {
        Component current = targetParent;
        while (current != null) {
            if (current.getId().equals(componentToMove.getId())) {
                throw new BadRequestException("Cycle detected: cannot move a component to be a child of its own descendant.");
            }
            current = current.getParent();
        }
    }

    private Component findComponentOrThrow(UUID id) {
        return componentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + id));
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to manage components in this organization.");
        }
    }

    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }
}
