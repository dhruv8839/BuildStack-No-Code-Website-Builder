package com.buildstack.publishing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/** Response DTO for a form submission record */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormSubmissionResponse {
    private UUID id;
    private String formNodeId;
    private UUID projectId;
    private UUID pageId;
    private String name;
    private String email;
    private String message;
    private LocalDateTime submittedAt;
}
