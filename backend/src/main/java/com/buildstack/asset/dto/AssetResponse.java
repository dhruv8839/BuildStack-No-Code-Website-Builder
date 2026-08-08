package com.buildstack.asset.dto;

import com.buildstack.asset.enums.AssetStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        UUID workspaceId,
        String filename,
        String url,
        String contentType,
        Long sizeBytes,
        Integer widthPx,
        Integer heightPx,
        AssetStatus status,
        LocalDateTime createdAt
) {}
