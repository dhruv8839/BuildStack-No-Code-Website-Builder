package com.buildstack.domain.event;

import java.util.UUID;

public record SSLActivatedEvent(UUID domainId, UUID projectId, String hostname) {}
