package com.buildstack.component.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import java.util.UUID;

public record ComponentUpdateRequest(
        UUID parentId,

        Map<String, Object> props,

        @NotNull(message = "Order index is required")
        Integer orderIndex
) {}
