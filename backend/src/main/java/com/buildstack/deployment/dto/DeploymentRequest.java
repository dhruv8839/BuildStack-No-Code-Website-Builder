package com.buildstack.deployment.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DeploymentRequest(
    @NotNull(message = "Website version ID is required")
    UUID websiteVersionId
) {}
