package com.buildstack.asset.controller;

import com.buildstack.asset.dto.AssetResponse;
import com.buildstack.asset.enums.AssetStatus;
import com.buildstack.asset.service.AssetService;
import com.buildstack.security.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AssetController.class)
@AutoConfigureMockMvc(addFilters = false)
class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AssetService assetService;

    @MockBean
    private JwtService jwtService;

    private final UUID workspaceId = UUID.randomUUID();
    private final UUID assetId = UUID.randomUUID();

    private AssetResponse sampleResponse() {
        return new AssetResponse(
                assetId, workspaceId, "logo.png",
                "http://localhost:8080/uploads/" + workspaceId + "/" + assetId + ".png",
                "image/png", 2048L, null, null, AssetStatus.ACTIVE, LocalDateTime.now());
    }

    @Test
    @WithMockUser
    void uploadAsset_shouldReturn201() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", new byte[512]);

        when(assetService.uploadAsset(eq(workspaceId), any())).thenReturn(sampleResponse());

        mockMvc.perform(multipart("/api/v1/workspaces/{workspaceId}/assets", workspaceId)
                        .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.filename").value("logo.png"))
                .andExpect(jsonPath("$.contentType").value("image/png"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser
    void getAssets_shouldReturn200WithPage() throws Exception {
        when(assetService.getAssetsForWorkspace(eq(workspaceId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleResponse())));

        mockMvc.perform(get("/api/v1/workspaces/{workspaceId}/assets", workspaceId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].filename").value("logo.png"));
    }

    @Test
    @WithMockUser
    void deleteAsset_shouldReturn204() throws Exception {
        doNothing().when(assetService).deleteAsset(workspaceId, assetId);

        mockMvc.perform(delete("/api/v1/workspaces/{workspaceId}/assets/{assetId}", workspaceId, assetId))
                .andExpect(status().isNoContent());
    }
}
