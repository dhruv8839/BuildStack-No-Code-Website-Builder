package com.buildstack.publishing.dto;

import com.buildstack.publishing.enums.PublishJobStatus;
import java.time.Instant;
import java.util.UUID;

public record PublishJobResponse(
        UUID id,
        UUID websiteVersionId,
        PublishJobStatus status,
        Integer progress,
        Instant startedAt,
        Instant completedAt,
        String errorMessage,
        Long triggeredById
) {}
