package com.buildstack.organization.dto;

import com.buildstack.organization.enums.OrganizationRole;
import jakarta.validation.constraints.NotNull;

public record OrganizationMemberRequest(
        @NotNull(message = "Role is required")
        OrganizationRole role
) {}
