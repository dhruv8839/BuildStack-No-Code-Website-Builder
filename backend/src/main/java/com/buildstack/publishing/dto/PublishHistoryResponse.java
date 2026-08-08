package com.buildstack.publishing.dto;

import com.buildstack.publishing.enums.PublishResult;
import java.time.Instant;
import java.util.UUID;

public record PublishHistoryResponse(
        UUID id,
        UUID websiteVersionId,
        Long authorId,
        String message,
        PublishResult result,
        ArtifactMetadataResponse artifactMetadata,
        Instant publishedAt
) {}
