package com.buildstack.organization.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record WorkspaceResponse(
        UUID id,
        UUID organizationId,
        String name,
        String key,
        String description,
        String color,
        String icon,
        boolean archived,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
