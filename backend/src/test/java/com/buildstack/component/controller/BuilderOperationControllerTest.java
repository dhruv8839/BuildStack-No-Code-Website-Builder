package com.buildstack.component.controller;

import com.buildstack.component.dto.BatchPropertyUpdateRequest;
import com.buildstack.component.dto.ComponentMoveRequest;
import com.buildstack.component.dto.ComponentReorderRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.service.BuilderOperationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import com.buildstack.security.jwt.JwtService;

@WebMvcTest(controllers = BuilderOperationController.class)
@AutoConfigureMockMvc(addFilters = false)
class BuilderOperationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BuilderOperationService builderOperationService;

    @MockBean
    private JwtService jwtService;

    @Test
    @WithMockUser
    void duplicateComponent_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        when(builderOperationService.duplicateComponent(eq(id))).thenReturn(new ComponentResponse(id, null, null, null, null, 0, null, null));
        
        mockMvc.perform(post("/api/v1/components/{id}/duplicate", id))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void moveComponent_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        ComponentMoveRequest req = new ComponentMoveRequest(UUID.randomUUID(), 1);
        
        when(builderOperationService.moveComponent(eq(id), any())).thenReturn(new ComponentResponse(id, null, null, null, null, 0, null, null));
        
        mockMvc.perform(post("/api/v1/components/{id}/move", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void reorderComponent_shouldReturn200() throws Exception {
        UUID id = UUID.randomUUID();
        ComponentReorderRequest req = new ComponentReorderRequest(2);
        
        when(builderOperationService.reorderComponent(eq(id), any())).thenReturn(new ComponentResponse(id, null, null, null, null, 0, null, null));
        
        mockMvc.perform(post("/api/v1/components/{id}/reorder", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void batchUpdateProperties_shouldReturn200() throws Exception {
        BatchPropertyUpdateRequest req = new BatchPropertyUpdateRequest(List.of(
            new BatchPropertyUpdateRequest.ComponentUpdate(UUID.randomUUID(), Map.of())
        ));
        
        when(builderOperationService.batchUpdateProperties(any())).thenReturn(List.of());
        
        mockMvc.perform(patch("/api/v1/components/batch/properties")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}
