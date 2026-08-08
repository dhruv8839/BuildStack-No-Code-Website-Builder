package com.buildstack.organization.controller;

import com.buildstack.organization.dto.OrganizationRequest;
import com.buildstack.organization.dto.OrganizationResponse;
import com.buildstack.organization.service.OrganizationService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrganizationController.class)
@AutoConfigureMockMvc(addFilters = false)
class OrganizationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrganizationService organizationService;

    @MockBean
    private JwtService jwtService;

    @Test
    void shouldCreateOrganizationAndReturn201() throws Exception {
        OrganizationRequest req = new OrganizationRequest("My Org", "my-org", "Desc", null);
        OrganizationResponse resp = new OrganizationResponse(UUID.randomUUID(), "My Org", "my-org", "Desc", null, 1L, null, null);

        when(organizationService.createOrganization(any(OrganizationRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/v1/organizations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("my-org"));
    }

    @Test
    void shouldReturn400WhenValidationFails() throws Exception {
        OrganizationRequest invalidReq = new OrganizationRequest("", "", "", null);

        mockMvc.perform(post("/api/v1/organizations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldGetAllOrganizationsAndReturn200() throws Exception {
        OrganizationResponse resp = new OrganizationResponse(UUID.randomUUID(), "My Org", "my-org", "Desc", null, 1L, null, null);
        when(organizationService.getAllOrganizations()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/v1/organizations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    void shouldGetOrganizationByIdAndReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        OrganizationResponse resp = new OrganizationResponse(id, "My Org", "my-org", "Desc", null, 1L, null, null);
        when(organizationService.getOrganizationById(id)).thenReturn(resp);

        mockMvc.perform(get("/api/v1/organizations/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("my-org"));
    }

    @Test
    void shouldUpdateOrganizationAndReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        OrganizationRequest req = new OrganizationRequest("My Org", "my-org", "Desc", null);
        OrganizationResponse resp = new OrganizationResponse(id, "My Org", "my-org", "Desc", null, 1L, null, null);
        
        when(organizationService.updateOrganization(eq(id), any(OrganizationRequest.class))).thenReturn(resp);

        mockMvc.perform(put("/api/v1/organizations/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("my-org"));
    }

    @Test
    void shouldDeleteOrganizationAndReturn204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/organizations/{id}", id))
                .andExpect(status().isNoContent());

        verify(organizationService).deleteOrganization(id);
    }
}
