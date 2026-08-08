package com.buildstack.publishing.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Stores form submissions received from published BuildStack pages.
 * Each record maps to one contact form submission (name, email, message).
 */
@Entity
@Table(name = "form_submissions", indexes = {
    @Index(name = "idx_form_submissions_project", columnList = "project_id"),
    @Index(name = "idx_form_submissions_form_node", columnList = "form_node_id"),
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormSubmission {

    @Id
    @GeneratedValue
    private UUID id;

    /** The node ID of the contact form component in the builder */
    @Column(name = "form_node_id", nullable = false)
    private String formNodeId;

    /** The project this form belongs to */
    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    /** The page ID this form is on */
    @Column(name = "page_id")
    private UUID pageId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(length = 4000)
    private String message;

    @CreationTimestamp
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;
}
