package com.buildstack.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WorkspaceRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name must not exceed 120 characters")
        String name,

        @NotBlank(message = "Key is required")
        @Size(max = 10, message = "Key must not exceed 10 characters")
        String key,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Color must be a valid HEX code")
        String color,

        @Size(max = 100, message = "Icon must not exceed 100 characters")
        String icon
) {
}
