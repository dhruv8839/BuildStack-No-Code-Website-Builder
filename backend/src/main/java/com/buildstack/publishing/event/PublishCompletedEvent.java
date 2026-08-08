package com.buildstack.publishing.event;

import java.util.UUID;

public record PublishCompletedEvent(UUID publishJobId, UUID publishHistoryId, UUID websiteVersionId) {}
