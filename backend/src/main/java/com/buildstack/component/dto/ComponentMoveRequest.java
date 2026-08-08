package com.buildstack.component.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ComponentMoveRequest(
        @NotNull UUID targetParentId,
        Integer orderIndex // Optional: if null, append to end
) {}
