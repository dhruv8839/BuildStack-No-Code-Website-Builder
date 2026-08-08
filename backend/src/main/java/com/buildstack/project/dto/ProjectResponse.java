package com.buildstack.project.dto;

import com.buildstack.project.enums.ProjectStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String customDomain,
        ProjectStatus status,
        UUID workspaceId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
