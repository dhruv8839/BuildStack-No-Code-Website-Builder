package com.buildstack.component.dto;

import jakarta.validation.constraints.NotNull;

public record ComponentReorderRequest(
        @NotNull Integer newOrderIndex
) {}
