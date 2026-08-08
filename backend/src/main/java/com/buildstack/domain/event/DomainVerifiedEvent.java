package com.buildstack.domain.event;

import java.util.UUID;

public record DomainVerifiedEvent(UUID domainId, UUID projectId, String hostname) {}
