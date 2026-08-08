package com.buildstack.project.service.impl;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.project.dto.ProjectCreateRequest;
import com.buildstack.project.dto.ProjectResponse;
import com.buildstack.project.dto.ProjectUpdateRequest;
import com.buildstack.project.entity.Project;
import com.buildstack.project.mapper.ProjectMapper;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final OrganizationMemberRepository memberRepository;
    private final ProjectMapper projectMapper;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request) {
        Workspace workspace = workspaceRepository.findById(request.workspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + request.workspaceId()));

        verifyAdminAccess(workspace.getOrganization().getId());

        String slug = request.slug().trim().toLowerCase();
        if (projectRepository.existsByWorkspaceIdAndSlug(request.workspaceId(), slug)) {
            throw new BadRequestException("Project with slug '" + slug + "' already exists in this workspace");
        }

        Project project = projectMapper.toEntity(request);
        project.setWorkspace(workspace);
        project.setSlug(slug);

        Project savedProject = projectRepository.save(project);
        return projectMapper.toResponse(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id) {
        Project project = findProjectOrThrow(id);
        verifyMemberAccess(project.getWorkspace().getOrganization().getId());
        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjectsForWorkspace(UUID workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));
                
        verifyMemberAccess(workspace.getOrganization().getId());

        return projectRepository.findAllByWorkspaceId(workspaceId).stream()
                .map(projectMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(UUID id, ProjectUpdateRequest request) {
        Project project = findProjectOrThrow(id);
        verifyAdminAccess(project.getWorkspace().getOrganization().getId());

        String newSlug = request.slug().trim().toLowerCase();
        if (!project.getSlug().equals(newSlug) &&
                projectRepository.existsByWorkspaceIdAndSlug(project.getWorkspace().getId(), newSlug)) {
            throw new BadRequestException("Project with slug '" + newSlug + "' already exists in this workspace");
        }

        projectMapper.updateEntityFromRequest(request, project);
        project.setSlug(newSlug);

        Project updatedProject = projectRepository.save(project);
        return projectMapper.toResponse(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(UUID id) {
        Project project = findProjectOrThrow(id);
        verifyAdminAccess(project.getWorkspace().getOrganization().getId());
        projectRepository.delete(project);
    }

    private Project findProjectOrThrow(UUID id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to manage projects in this organization.");
        }
    }
    
    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }
}
