package com.buildstack.deployment.event;

import java.util.UUID;

public record RollbackCompletedEvent(UUID newDeploymentId, UUID previousDeploymentId, UUID projectId) {}
