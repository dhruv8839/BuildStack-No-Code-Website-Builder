package com.buildstack.publishing.event;

import java.util.UUID;

public record VersionCreatedEvent(UUID websiteVersionId, UUID projectId, Long authorId) {}
