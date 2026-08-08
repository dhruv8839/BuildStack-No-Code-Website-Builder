package com.buildstack.component.dto;

import com.buildstack.component.enums.ComponentType;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record ComponentResponse(
        UUID id,
        UUID pageId,
        UUID parentId,
        ComponentType type,
        Map<String, Object> props,
        Integer orderIndex,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
