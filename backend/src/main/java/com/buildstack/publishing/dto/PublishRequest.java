package com.buildstack.publishing.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PublishRequest(
        @NotNull(message = "Website Version ID is required")
        UUID websiteVersionId
) {}
