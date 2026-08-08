package com.buildstack.domain.dto;

import com.buildstack.domain.enums.DomainVerificationStatus;
import com.buildstack.domain.enums.SslStatus;

import java.time.Instant;
import java.util.UUID;

public record DomainResponse(
    UUID id,
    UUID projectId,
    String hostname,
    boolean custom,
    DomainVerificationStatus verificationStatus,
    SslStatus sslStatus,
    boolean active,
    Instant createdAt,
    Instant updatedAt
) {}
