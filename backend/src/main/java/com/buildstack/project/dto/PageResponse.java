package com.buildstack.project.dto;

import com.buildstack.project.enums.PageStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record PageResponse(
        UUID id,
        String name,
        String slug,
        String title,
        String description,
        boolean isHomePage,
        PageStatus status,
        UUID projectId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
