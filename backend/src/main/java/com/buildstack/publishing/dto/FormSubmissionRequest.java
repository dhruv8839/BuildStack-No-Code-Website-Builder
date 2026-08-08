package com.buildstack.publishing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request body for submitting a contact form from a published page */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormSubmissionRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    @Size(max = 200)
    private String email;

    @Size(max = 4000)
    private String message;
}
