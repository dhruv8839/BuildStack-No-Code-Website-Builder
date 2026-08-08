package com.buildstack.publishing.event;

import java.util.UUID;

public record PublishStartedEvent(UUID publishJobId, UUID websiteVersionId, Long triggeredById) {}
