package com.buildstack.publishing.dto;

import com.buildstack.publishing.enums.WebsiteVersionStatus;
import java.time.Instant;
import java.util.UUID;

public record WebsiteVersionResponse(
        UUID id,
        UUID projectId,
        Integer versionNumber,
        WebsiteVersionStatus status,
        Long createdById,
        Instant createdAt,
        Instant updatedAt
) {}
