package com.buildstack.deployment.dto;

import com.buildstack.deployment.enums.DeploymentStatus;
import com.buildstack.deployment.enums.DeploymentType;
import java.time.Instant;
import java.util.UUID;

public record DeploymentResponse(
    UUID id,
    UUID projectId,
    UUID websiteVersionId,
    Integer versionNumber,
    DeploymentType type,
    DeploymentStatus status,
    String deployedByEmail,
    String message,
    Instant startedAt,
    Instant completedAt,
    Instant expiresAt
) {}
