package com.buildstack.deployment.event;

import java.util.UUID;

public record DeploymentCompletedEvent(UUID deploymentId, UUID projectId, UUID versionId) {}
