package com.buildstack.deployment.event;

import java.util.UUID;

public record DeploymentFailedEvent(UUID deploymentId, UUID projectId, String reason) {}
