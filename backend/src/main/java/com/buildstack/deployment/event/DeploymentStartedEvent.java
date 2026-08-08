package com.buildstack.deployment.event;

import java.util.UUID;

public record DeploymentStartedEvent(UUID deploymentId, UUID projectId, UUID versionId) {}
