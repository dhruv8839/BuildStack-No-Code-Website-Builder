package com.buildstack.project.service;

import com.buildstack.project.dto.ProjectCreateRequest;
import com.buildstack.project.dto.ProjectResponse;
import com.buildstack.project.dto.ProjectUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
    ProjectResponse createProject(ProjectCreateRequest request);
    ProjectResponse getProjectById(UUID id);
    List<ProjectResponse> getAllProjectsForWorkspace(UUID workspaceId);
    ProjectResponse updateProject(UUID id, ProjectUpdateRequest request);
    void deleteProject(UUID id);
}
