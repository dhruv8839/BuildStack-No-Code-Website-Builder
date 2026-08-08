package com.buildstack.organization.controller;

import com.buildstack.organization.dto.OrganizationMemberRequest;
import com.buildstack.organization.dto.OrganizationMemberResponse;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.service.OrganizationMemberService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrganizationMemberController.class)
@AutoConfigureMockMvc(addFilters = false)
class OrganizationMemberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrganizationMemberService memberService;

    @MockBean
    private JwtService jwtService;

    @Test
    void shouldGetMembersAndReturn200() throws Exception {
        UUID orgId = UUID.randomUUID();
        OrganizationMemberResponse resp = new OrganizationMemberResponse(UUID.randomUUID(), orgId, 1L, "user@test.com", OrganizationRole.MEMBER, null, LocalDateTime.now(), true);
        when(memberService.getMembers(orgId)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/v1/organizations/{organizationId}/members", orgId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }

    @Test
    void shouldUpdateMemberRoleAndReturn200() throws Exception {
        UUID orgId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        OrganizationMemberRequest req = new OrganizationMemberRequest(OrganizationRole.ADMIN);
        OrganizationMemberResponse resp = new OrganizationMemberResponse(memberId, orgId, 1L, "user@test.com", OrganizationRole.ADMIN, null, LocalDateTime.now(), true);
        
        when(memberService.updateMemberRole(eq(orgId), eq(memberId), any(OrganizationMemberRequest.class))).thenReturn(resp);

        mockMvc.perform(put("/api/v1/organizations/{organizationId}/members/{memberId}/role", orgId, memberId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void shouldRemoveMemberAndReturn204() throws Exception {
        UUID orgId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/organizations/{organizationId}/members/{memberId}", orgId, memberId))
                .andExpect(status().isNoContent());

        verify(memberService).removeMember(orgId, memberId);
    }

    @Test
    void shouldLeaveOrganizationAndReturn204() throws Exception {
        UUID orgId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/organizations/{organizationId}/members/leave", orgId))
                .andExpect(status().isNoContent());

        verify(memberService).leaveOrganization(orgId);
    }
}
