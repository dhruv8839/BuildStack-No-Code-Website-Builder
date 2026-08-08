package com.buildstack.organization.controller;

import com.buildstack.organization.dto.WorkspaceRequest;
import com.buildstack.organization.dto.WorkspaceResponse;
import com.buildstack.organization.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping("/organizations/{organizationId}/workspaces")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceResponse createWorkspace(
            @PathVariable UUID organizationId,
            @Valid @RequestBody WorkspaceRequest request) {
        return workspaceService.createWorkspace(organizationId, request);
    }

    @GetMapping("/organizations/{organizationId}/workspaces")
    @ResponseStatus(HttpStatus.OK)
    public List<WorkspaceResponse> getOrganizationWorkspaces(@PathVariable UUID organizationId) {
        return workspaceService.getOrganizationWorkspaces(organizationId);
    }

    @GetMapping("/workspaces/{id}")
    @ResponseStatus(HttpStatus.OK)
    public WorkspaceResponse getWorkspaceById(@PathVariable UUID id) {
        return workspaceService.getWorkspace(id);
    }

    @PutMapping("/workspaces/{id}")
    @ResponseStatus(HttpStatus.OK)
    public WorkspaceResponse updateWorkspace(
            @PathVariable UUID id,
            @Valid @RequestBody WorkspaceRequest request) {
        return workspaceService.updateWorkspace(id, request);
    }

    @DeleteMapping("/workspaces/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWorkspace(@PathVariable UUID id) {
        workspaceService.deleteWorkspace(id);
    }

    @PatchMapping("/workspaces/{id}/archive")
    @ResponseStatus(HttpStatus.OK)
    public WorkspaceResponse archiveWorkspace(@PathVariable UUID id) {
        return workspaceService.archiveWorkspace(id);
    }

    @PatchMapping("/workspaces/{id}/restore")
    @ResponseStatus(HttpStatus.OK)
    public WorkspaceResponse restoreWorkspace(@PathVariable UUID id) {
        return workspaceService.restoreWorkspace(id);
    }
}
