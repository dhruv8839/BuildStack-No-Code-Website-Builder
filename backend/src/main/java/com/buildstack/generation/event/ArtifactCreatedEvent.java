package com.buildstack.generation.event;

import java.util.UUID;

public record ArtifactCreatedEvent(UUID publishJobId, UUID artifactMetadataId) {}
