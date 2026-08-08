package com.buildstack.generation.event;

import java.util.UUID;

public record SiteGenerationCompletedEvent(UUID publishJobId, UUID websiteVersionId) {}
