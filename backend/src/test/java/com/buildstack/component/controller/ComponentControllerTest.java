package com.buildstack.component.controller;

import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.service.ComponentService;
import com.buildstack.security.jwt.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ComponentController.class)
@AutoConfigureMockMvc(addFilters = false)
class ComponentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ComponentService componentService;

    @MockBean
    private JwtService jwtService;

    @Test
    @WithMockUser
    void createComponent_shouldReturn201() throws Exception {
        UUID pageId = UUID.randomUUID();
        ComponentCreateRequest request = new ComponentCreateRequest(null, ComponentType.TEXT, new HashMap<>(), 0);
        
        ComponentResponse response = new ComponentResponse(UUID.randomUUID(), pageId, null, ComponentType.TEXT, new HashMap<>(), 0, null, null);
        
        when(componentService.createComponent(eq(pageId), any(ComponentCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/pages/{pageId}/components", pageId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("TEXT"));
    }

    @Test
    @WithMockUser
    void updateComponentProperties_shouldReturn200() throws Exception {
        UUID componentId = UUID.randomUUID();
        
        Map<String, Object> props = new HashMap<>();
        props.put("text", "New Value");
        com.buildstack.component.dto.ComponentPropertyUpdateRequest request = new com.buildstack.component.dto.ComponentPropertyUpdateRequest(props);
        
        com.buildstack.component.dto.ComponentPropertyResponse response = new com.buildstack.component.dto.ComponentPropertyResponse(componentId, props);
        
        when(componentService.mergeProperties(eq(componentId), any())).thenReturn(response);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/components/{componentId}/properties", componentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.props.text").value("New Value"));
    }

    @Test
    @WithMockUser
    void updateComponentProperties_withResponsivePayload_shouldReturn200() throws Exception {
        UUID componentId = UUID.randomUUID();
        
        Map<String, Object> mobileProps = new HashMap<>();
        mobileProps.put("text", "Mobile Value");
        
        Map<String, Object> responsive = new HashMap<>();
        responsive.put("mobile", mobileProps);
        
        Map<String, Object> props = new HashMap<>();
        props.put("text", "Desktop Value");
        props.put("responsive", responsive);
        
        com.buildstack.component.dto.ComponentPropertyUpdateRequest request = new com.buildstack.component.dto.ComponentPropertyUpdateRequest(props);
        
        com.buildstack.component.dto.ComponentPropertyResponse response = new com.buildstack.component.dto.ComponentPropertyResponse(componentId, props);
        
        when(componentService.mergeProperties(eq(componentId), any())).thenReturn(response);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/components/{componentId}/properties", componentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.props.text").value("Desktop Value"))
                .andExpect(jsonPath("$.props.responsive.mobile.text").value("Mobile Value"));
    }
}
