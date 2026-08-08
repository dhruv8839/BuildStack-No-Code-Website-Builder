package com.buildstack.organization.dto;

import com.buildstack.organization.enums.OrganizationRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizationMemberResponse(
        UUID id,
        UUID organizationId,
        Long userId,
        String userEmail,
        OrganizationRole role,
        Long invitedById,
        LocalDateTime joinedAt,
        boolean active
) {}
