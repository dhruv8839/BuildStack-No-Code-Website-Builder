package com.buildstack.publishing.dto;

import java.time.Instant;
import java.util.UUID;

public record ArtifactMetadataResponse(
        UUID id,
        String checksum,
        String buildHash,
        Long sizeBytes,
        Instant createdAt
) {}
