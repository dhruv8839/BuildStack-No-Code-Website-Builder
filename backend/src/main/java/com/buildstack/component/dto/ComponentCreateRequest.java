package com.buildstack.component.dto;

import com.buildstack.component.enums.ComponentType;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

public record ComponentCreateRequest(
        UUID parentId,

        @NotNull(message = "Type is required")
        ComponentType type,

        Map<String, Object> props,

        @NotNull(message = "Order index is required")
        Integer orderIndex
) {}
