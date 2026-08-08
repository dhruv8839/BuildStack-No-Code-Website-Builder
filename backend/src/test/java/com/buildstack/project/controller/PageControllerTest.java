package com.buildstack.project.controller;

import com.buildstack.security.jwt.JwtService;
import com.buildstack.project.dto.PageCreateRequest;
import com.buildstack.project.dto.PageResponse;
import com.buildstack.project.enums.PageStatus;
import com.buildstack.project.service.PageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PageController.class)
@AutoConfigureMockMvc(addFilters = false)
class PageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PageService pageService;

    @MockBean
    private JwtService jwtService;

    @Test
    @WithMockUser
    void createPage_shouldReturn201() throws Exception {
        UUID projectId = UUID.randomUUID();
        PageCreateRequest request = new PageCreateRequest("Home", "home", "Home Title", "Desc", true);
        
        PageResponse response = new PageResponse(UUID.randomUUID(), "Home", "home", "Home Title", "Desc", true, PageStatus.DRAFT, projectId, null, null);
        
        when(pageService.createPage(eq(projectId), any(PageCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/projects/{projectId}/pages", projectId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Home"))
                .andExpect(jsonPath("$.slug").value("home"));
    }
}
