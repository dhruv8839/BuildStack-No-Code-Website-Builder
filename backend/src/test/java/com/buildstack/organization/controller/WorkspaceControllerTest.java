package com.buildstack.organization.controller;

import com.buildstack.organization.dto.WorkspaceRequest;
import com.buildstack.organization.dto.WorkspaceResponse;
import com.buildstack.organization.service.WorkspaceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.buildstack.security.jwt.JwtService;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WorkspaceController.class)
@AutoConfigureMockMvc(addFilters = false)
class WorkspaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WorkspaceService workspaceService;

    @MockBean
    private JwtService jwtService;

    @Test
    void shouldCreateWorkspaceAndReturn201() throws Exception {
        UUID orgId = UUID.randomUUID();
        WorkspaceRequest req = new WorkspaceRequest("My WS", "WS1", "Desc", null, null);
        WorkspaceResponse resp = new WorkspaceResponse(UUID.randomUUID(), orgId, "My WS", "WS1", "Desc", null, null, false, null, null);

        when(workspaceService.createWorkspace(eq(orgId), any(WorkspaceRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/v1/organizations/{organizationId}/workspaces", orgId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.key").value("WS1"));
    }

    @Test
    void shouldGetWorkspacesByOrgIdAndReturn200() throws Exception {
        UUID orgId = UUID.randomUUID();
        WorkspaceResponse resp = new WorkspaceResponse(UUID.randomUUID(), orgId, "My WS", "WS1", "Desc", null, null, false, null, null);
        when(workspaceService.getOrganizationWorkspaces(orgId)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/v1/organizations/{organizationId}/workspaces", orgId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    void shouldUpdateWorkspaceAndReturn200() throws Exception {
        UUID wsId = UUID.randomUUID();
        WorkspaceRequest req = new WorkspaceRequest("My WS Updated", "WS1", "Desc", null, null);
        WorkspaceResponse resp = new WorkspaceResponse(wsId, UUID.randomUUID(), "My WS Updated", "WS1", "Desc", null, null, false, null, null);
        
        when(workspaceService.updateWorkspace(eq(wsId), any(WorkspaceRequest.class))).thenReturn(resp);

        mockMvc.perform(put("/api/v1/workspaces/{id}", wsId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("My WS Updated"));
    }

    @Test
    void shouldArchiveWorkspaceAndReturn200() throws Exception {
        UUID wsId = UUID.randomUUID();
        WorkspaceResponse resp = new WorkspaceResponse(wsId, UUID.randomUUID(), "My WS Updated", "WS1", "Desc", null, null, true, null, null);
        
        when(workspaceService.archiveWorkspace(wsId)).thenReturn(resp);

        mockMvc.perform(patch("/api/v1/workspaces/{id}/archive", wsId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.archived").value(true));
    }

    @Test
    void shouldDeleteWorkspaceAndReturn204() throws Exception {
        UUID wsId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/workspaces/{id}", wsId))
                .andExpect(status().isNoContent());

        verify(workspaceService).deleteWorkspace(wsId);
    }
}
