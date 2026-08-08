package com.buildstack.component.service.impl;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.component.dto.BatchPropertyUpdateRequest;
import com.buildstack.component.dto.ComponentMoveRequest;
import com.buildstack.component.dto.ComponentReorderRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.entity.Component;
import com.buildstack.component.mapper.ComponentMapper;
import com.buildstack.component.property.registry.ComponentDefinition;
import com.buildstack.component.property.registry.ComponentRegistry;
import com.buildstack.component.property.util.JsonMergeUtil;
import com.buildstack.component.property.validation.PropertyValidator;
import com.buildstack.component.repository.ComponentRepository;
import com.buildstack.component.service.BuilderOperationService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuilderOperationServiceImpl implements BuilderOperationService {

    private final ComponentRepository componentRepository;
    private final OrganizationMemberRepository memberRepository;
    private final ComponentMapper componentMapper;
    private final CurrentUserService currentUserService;
    private final PropertyValidator propertyValidator;
    private final ComponentRegistry componentRegistry;

    @Override
    @Transactional
    public ComponentResponse duplicateComponent(UUID componentId) {
        Component root = findComponentOrThrow(componentId);
        verifyAdminAccess(root.getPage().getProject().getWorkspace().getOrganization().getId());
        
        // Cannot duplicate if the parent doesn't allow it, but generally allowed if existing root exists
        // Wait, a component can be duplicated into its parent.
        
        List<Component> allDescendants = componentRepository.findAllByPageIdOrderByOrderIndexAsc(root.getPage().getId());
        
        // Find children mapping
        Map<UUID, List<Component>> childrenMap = new HashMap<>();
        for (Component c : allDescendants) {
            if (c.getParent() != null) {
                childrenMap.computeIfAbsent(c.getParent().getId(), k -> new ArrayList<>()).add(c);
            }
        }
        
        List<Component> duplicatedComponents = new ArrayList<>();
        Component duplicatedRoot = duplicateRecursive(root, root.getParent(), childrenMap, duplicatedComponents);
        
        // Shift order index for the new sibling
        int newOrderIndex = root.getOrderIndex() + 1;
        shiftSiblingsAfter(root.getParent(), newOrderIndex, 1, allDescendants);
        duplicatedRoot.setOrderIndex(newOrderIndex);
        
        componentRepository.saveAll(duplicatedComponents);
        
        return componentMapper.toResponse(duplicatedRoot);
    }
    
    private Component duplicateRecursive(Component original, Component newParent, Map<UUID, List<Component>> childrenMap, List<Component> saveList) {
        Component copy = new Component();
        copy.setPage(original.getPage());
        copy.setParent(newParent);
        copy.setType(original.getType());
        copy.setOrderIndex(original.getOrderIndex());
        
        // Deep copy properties
        if (original.getProps() != null) {
            copy.setProps(deepCopyProps(original.getProps()));
        } else {
            copy.setProps(new HashMap<>());
        }
        
        saveList.add(copy);
        
        List<Component> children = childrenMap.get(original.getId());
        if (children != null) {
            for (Component child : children) {
                duplicateRecursive(child, copy, childrenMap, saveList);
            }
        }
        
        return copy;
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> deepCopyProps(Map<String, Object> original) {
        // A simple JSON round-trip could also work, or a recursive deep copy.
        // For now, utilizing JsonMergeUtil with empty target to create a deep copy
        return JsonMergeUtil.merge(new HashMap<>(), original);
    }

    @Override
    @Transactional
    public ComponentResponse moveComponent(UUID componentId, ComponentMoveRequest request) {
        Component component = findComponentOrThrow(componentId);
        verifyAdminAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());
        
        Component targetParent = findComponentOrThrow(request.targetParentId());
        
        if (!component.getPage().getId().equals(targetParent.getPage().getId())) {
            throw new BadRequestException("Cannot move component to a different page.");
        }
        
        validateNoCycle(component, targetParent);
        
        // Validate registry allowed parent/child
        ComponentDefinition parentDef = componentRegistry.getDefinition(targetParent.getType());
        if (parentDef != null && !parentDef.isCanHaveChildren()) {
            throw new BadRequestException("Target component cannot have children.");
        }
        
        List<Component> allInPage = componentRepository.findAllByPageIdOrderByOrderIndexAsc(component.getPage().getId());
        
        // Remove from old parent siblings
        shiftSiblingsAfter(component.getParent(), component.getOrderIndex() + 1, -1, allInPage);
        
        // Add to new parent siblings
        List<Component> newSiblings = allInPage.stream()
                .filter(c -> c.getParent() != null && c.getParent().getId().equals(targetParent.getId()) && !c.getId().equals(componentId))
                .toList();
                
        int newIndex = request.orderIndex() != null ? request.orderIndex() : newSiblings.size();
        if (newIndex < 0) newIndex = 0;
        if (newIndex > newSiblings.size()) newIndex = newSiblings.size();
        
        shiftSiblingsAfter(targetParent, newIndex, 1, allInPage);
        
        component.setParent(targetParent);
        component.setOrderIndex(newIndex);
        
        componentRepository.saveAll(allInPage); // Save all changes including shifted
        
        return componentMapper.toResponse(component);
    }

    @Override
    @Transactional
    public ComponentResponse reorderComponent(UUID componentId, ComponentReorderRequest request) {
        Component component = findComponentOrThrow(componentId);
        verifyAdminAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());
        
        List<Component> allInPage = componentRepository.findAllByPageIdOrderByOrderIndexAsc(component.getPage().getId());
        
        List<Component> siblings = allInPage.stream()
                .filter(c -> {
                    if (component.getParent() == null) return c.getParent() == null;
                    return c.getParent() != null && c.getParent().getId().equals(component.getParent().getId());
                })
                .sorted((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
                .toList();
                
        int oldIndex = component.getOrderIndex();
        int newIndex = request.newOrderIndex();
        
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= siblings.size()) newIndex = siblings.size() - 1;
        
        if (oldIndex == newIndex) {
            return componentMapper.toResponse(component);
        }
        
        // Simple reorder: shift elements between oldIndex and newIndex
        if (newIndex > oldIndex) {
            for (Component c : siblings) {
                if (c.getOrderIndex() > oldIndex && c.getOrderIndex() <= newIndex) {
                    c.setOrderIndex(c.getOrderIndex() - 1);
                }
            }
        } else {
            for (Component c : siblings) {
                if (c.getOrderIndex() >= newIndex && c.getOrderIndex() < oldIndex) {
                    c.setOrderIndex(c.getOrderIndex() + 1);
                }
            }
        }
        
        component.setOrderIndex(newIndex);
        componentRepository.saveAll(siblings);
        
        return componentMapper.toResponse(component);
    }

    @Override
    @Transactional
    public List<ComponentResponse> batchUpdateProperties(BatchPropertyUpdateRequest request) {
        if (request.updates() == null || request.updates().isEmpty()) {
            return List.of();
        }
        
        // Group by organization to verify access
        List<Component> updatedComponents = new ArrayList<>();
        
        for (BatchPropertyUpdateRequest.ComponentUpdate update : request.updates()) {
            Component component = findComponentOrThrow(update.componentId());
            verifyAdminAccess(component.getPage().getProject().getWorkspace().getOrganization().getId());
            
            Map<String, Object> mergedProps = JsonMergeUtil.merge(component.getProps(), update.props());
            propertyValidator.validate(component.getType(), mergedProps);
            
            component.setProps(mergedProps);
            updatedComponents.add(component);
        }
        
        componentRepository.saveAll(updatedComponents);
        
        return updatedComponents.stream()
                .map(componentMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    private void shiftSiblingsAfter(Component parent, int afterIndexInclusive, int shiftAmount, List<Component> allInPage) {
        for (Component c : allInPage) {
            boolean sameParent = (parent == null && c.getParent() == null) || 
                                 (parent != null && c.getParent() != null && c.getParent().getId().equals(parent.getId()));
            if (sameParent && c.getOrderIndex() >= afterIndexInclusive) {
                c.setOrderIndex(c.getOrderIndex() + shiftAmount);
            }
        }
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
}
