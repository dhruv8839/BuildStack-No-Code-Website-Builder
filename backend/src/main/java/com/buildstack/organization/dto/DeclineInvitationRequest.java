package com.buildstack.organization.dto;

import jakarta.validation.constraints.NotBlank;

public record DeclineInvitationRequest(
        @NotBlank(message = "Token is required")
        String token
) {}
