package com.buildstack.organization.service;

import com.buildstack.asset.service.AssetService;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final OrganizationRepository organizationRepository;
    private final WorkspaceMapper workspaceMapper;
    private final CurrentUserService currentUserService;
    private final AssetService assetService;

    @Transactional
    public WorkspaceResponse createWorkspace(UUID organizationId, WorkspaceRequest request) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + organizationId));
        
        verifyOrganizationOwnership(organization);

        String key = request.key().trim().toUpperCase();
        if (workspaceRepository.existsByOrganizationIdAndKey(organizationId, key)) {
            throw new BadRequestException("Workspace with key '" + key + "' already exists in this organization");
        }

        Workspace workspace = workspaceMapper.toEntity(request);
        organization.addWorkspace(workspace);

        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return workspaceMapper.toResponse(savedWorkspace);
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(UUID id, WorkspaceRequest request) {
        Workspace workspace = findWorkspaceOrThrow(id);
        verifyOrganizationOwnership(workspace.getOrganization());

        String key = request.key().trim().toUpperCase();
        if (!workspace.getKey().equals(key) &&
                workspaceRepository.existsByOrganizationIdAndKey(workspace.getOrganization().getId(), key)) {
            throw new BadRequestException("Workspace with key '" + key + "' already exists in this organization");
        }

        workspaceMapper.updateEntityFromRequest(request, workspace);
        Workspace updatedWorkspace = workspaceRepository.save(workspace);
        return workspaceMapper.toResponse(updatedWorkspace);
    }

    @Transactional
    public WorkspaceResponse archiveWorkspace(UUID id) {
        Workspace workspace = findWorkspaceOrThrow(id);
        verifyOrganizationOwnership(workspace.getOrganization());
        
        workspace.setArchived(true);
        return workspaceMapper.toResponse(workspaceRepository.save(workspace));
    }

    @Transactional
    public WorkspaceResponse restoreWorkspace(UUID id) {
        Workspace workspace = findWorkspaceOrThrow(id);
        verifyOrganizationOwnership(workspace.getOrganization());
        
        workspace.setArchived(false);
        return workspaceMapper.toResponse(workspaceRepository.save(workspace));
    }

    @Transactional
    public void deleteWorkspace(UUID id) {
        Workspace workspace = findWorkspaceOrThrow(id);
        verifyOrganizationOwnership(workspace.getOrganization());
        
        workspace.getOrganization().removeWorkspace(workspace);
        assetService.deleteAllAssetsForWorkspace(workspace.getId());
        workspaceRepository.delete(workspace);
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(UUID id) {
        return workspaceMapper.toResponse(findWorkspaceOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getOrganizationWorkspaces(UUID organizationId) {
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException("Organization not found with id: " + organizationId);
        }
        return workspaceRepository.findAllByOrganizationId(organizationId).stream()
                .map(workspaceMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Workspace findWorkspaceOrThrow(UUID id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + id));
    }

    private void verifyOrganizationOwnership(Organization organization) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!organization.getCreatedBy().getId().equals(currentUserId)) {
            throw new AccessDeniedException("User is not authorized to manipulate workspaces in this organization.");
        }
    }
}
