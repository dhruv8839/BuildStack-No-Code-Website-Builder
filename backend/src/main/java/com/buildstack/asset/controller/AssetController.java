package com.buildstack.asset.controller;

import com.buildstack.asset.dto.AssetResponse;
import com.buildstack.asset.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetResponse> uploadAsset(
            @PathVariable UUID workspaceId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assetService.uploadAsset(workspaceId, file));
    }

    @GetMapping
    public ResponseEntity<Page<AssetResponse>> getAssets(
            @PathVariable UUID workspaceId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(assetService.getAssetsForWorkspace(workspaceId, pageable));
    }

    @GetMapping("/{assetId}")
    public ResponseEntity<AssetResponse> getAsset(
            @PathVariable UUID workspaceId,
            @PathVariable UUID assetId) {
        return ResponseEntity.ok(assetService.getAssetById(workspaceId, assetId));
    }

    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable UUID workspaceId,
            @PathVariable UUID assetId) {
        assetService.deleteAsset(workspaceId, assetId);
        return ResponseEntity.noContent().build();
    }
}
