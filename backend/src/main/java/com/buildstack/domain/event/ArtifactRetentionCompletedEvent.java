package com.buildstack.domain.event;

import java.util.UUID;

public record ArtifactRetentionCompletedEvent(UUID projectId, int artifactsDeleted) {}
