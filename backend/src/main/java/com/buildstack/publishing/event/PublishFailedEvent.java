package com.buildstack.publishing.event;

import java.util.UUID;

public record PublishFailedEvent(UUID publishJobId, UUID websiteVersionId, String errorMessage) {}
