package com.buildstack.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record DomainRequest(
    @NotBlank(message = "Hostname is required")
    String hostname
) {}
