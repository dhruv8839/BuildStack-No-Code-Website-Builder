package com.buildstack.integration;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.config.TestBase;
import com.buildstack.organization.dto.OrganizationRequest;
import com.buildstack.organization.dto.WorkspaceRequest;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.util.TestFixtures;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc(addFilters = false)
public class OrganizationIntegrationTest extends TestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private CurrentUserService currentUserService;

    private User testUser;

    @BeforeEach
    void setUp() {
        workspaceRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(TestFixtures.createTestUser(null, "owner@test.com"));
    }

    @Test
    void testCompleteWorkflow() throws Exception {
        when(currentUserService.getCurrentUserId()).thenReturn(testUser.getId());
        when(currentUserService.getCurrentUser()).thenReturn(testUser);

        // 1. Create Organization
        OrganizationRequest orgReq = new OrganizationRequest("Integration Org", "int-org", "Integration Testing", null);
        String orgResponse = mockMvc.perform(post("/api/v1/organizations")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orgReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("int-org"))
                .andReturn().getResponse().getContentAsString();
        
        String orgId = objectMapper.readTree(orgResponse).get("id").asText();

        // Verify DB
        assertThat(organizationRepository.count()).isEqualTo(1);

        // 2. Create Workspace
        WorkspaceRequest wsReq = new WorkspaceRequest("Test Workspace", "TST1", "Test Env", null, null);
        mockMvc.perform(post("/api/v1/organizations/{id}/workspaces", orgId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wsReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.key").value("TST1"));

        // Verify DB
        assertThat(workspaceRepository.count()).isEqualTo(1);

        // 3. Get Organization Workspaces
        mockMvc.perform(get("/api/v1/organizations/{id}/workspaces", orgId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }
}
