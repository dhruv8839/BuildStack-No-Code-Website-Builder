package com.buildstack.organization.dto;

import com.buildstack.organization.enums.InvitationStatus;
import com.buildstack.organization.enums.OrganizationRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record InvitationResponse(
        UUID id,
        UUID organizationId,
        String email,
        OrganizationRole role,
        InvitationStatus status,
        Long invitedById,
        LocalDateTime expiresAt,
        LocalDateTime acceptedAt,
        LocalDateTime createdAt
) {}
