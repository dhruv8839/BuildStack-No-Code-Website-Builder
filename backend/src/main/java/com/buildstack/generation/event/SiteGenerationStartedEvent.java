package com.buildstack.generation.event;

import java.util.UUID;

public record SiteGenerationStartedEvent(UUID publishJobId, UUID websiteVersionId) {}
