package com.buildstack.project.controller;

import com.buildstack.project.dto.ProjectCreateRequest;
import com.buildstack.project.dto.ProjectResponse;
import com.buildstack.project.dto.ProjectUpdateRequest;
import com.buildstack.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsForWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(projectService.getAllProjectsForWorkspace(workspaceId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectUpdateRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ProjectResponse> duplicateProject(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.duplicateProject(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
