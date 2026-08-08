package com.buildstack.publishing.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record WebsiteVersionCreateRequest(
        @NotNull(message = "Project ID is required")
        UUID projectId
) {}
