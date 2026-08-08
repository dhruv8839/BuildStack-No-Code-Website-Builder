package com.buildstack.organization.controller;

import com.buildstack.organization.dto.AcceptInvitationRequest;
import com.buildstack.organization.dto.DeclineInvitationRequest;
import com.buildstack.organization.dto.InvitationRequest;
import com.buildstack.organization.dto.InvitationResponse;
import com.buildstack.organization.enums.InvitationStatus;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.service.OrganizationInvitationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.buildstack.security.jwt.JwtService;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrganizationInvitationController.class)
@AutoConfigureMockMvc(addFilters = false)
class OrganizationInvitationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrganizationInvitationService invitationService;

    @MockBean
    private JwtService jwtService;

    @Test
    void shouldInviteAndReturn201() throws Exception {
        UUID orgId = UUID.randomUUID();
        InvitationRequest req = new InvitationRequest("guest@test.com", OrganizationRole.MEMBER);
        InvitationResponse resp = new InvitationResponse(UUID.randomUUID(), orgId, "guest@test.com", OrganizationRole.MEMBER, InvitationStatus.PENDING, 1L, LocalDateTime.now().plusDays(7), null, LocalDateTime.now());

        when(invitationService.invite(eq(orgId), any(InvitationRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/v1/organizations/{organizationId}/invitations", orgId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("guest@test.com"));
    }

    @Test
    void shouldGetPendingInvitationsAndReturn200() throws Exception {
        UUID orgId = UUID.randomUUID();
        InvitationResponse resp = new InvitationResponse(UUID.randomUUID(), orgId, "guest@test.com", OrganizationRole.MEMBER, InvitationStatus.PENDING, 1L, LocalDateTime.now().plusDays(7), null, LocalDateTime.now());
        
        when(invitationService.getPendingInvitations(orgId)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/v1/organizations/{organizationId}/invitations", orgId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    void shouldCancelInvitationAndReturn204() throws Exception {
        UUID orgId = UUID.randomUUID();
        UUID invId = UUID.randomUUID();

        mockMvc.perform(patch("/api/v1/organizations/{organizationId}/invitations/{invitationId}/cancel", orgId, invId))
                .andExpect(status().isNoContent());

        verify(invitationService).cancel(orgId, invId);
    }

    @Test
    void shouldAcceptInvitationAndReturn200() throws Exception {
        AcceptInvitationRequest req = new AcceptInvitationRequest("TOKEN123");

        mockMvc.perform(post("/api/v1/invitations/accept")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(invitationService).accept("TOKEN123");
    }

    @Test
    void shouldDeclineInvitationAndReturn200() throws Exception {
        DeclineInvitationRequest req = new DeclineInvitationRequest("TOKEN123");

        mockMvc.perform(post("/api/v1/invitations/decline")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(invitationService).decline("TOKEN123");
    }
}
