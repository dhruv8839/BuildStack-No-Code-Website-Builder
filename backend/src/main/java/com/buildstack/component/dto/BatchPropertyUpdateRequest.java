package com.buildstack.component.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record BatchPropertyUpdateRequest(
        @NotEmpty List<ComponentUpdate> updates
) {
    public record ComponentUpdate(
            @NotNull UUID componentId,
            @NotNull Map<String, Object> props
    ) {}
}
