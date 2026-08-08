package com.buildstack.domain.entity;

import com.buildstack.domain.enums.DomainVerificationStatus;
import com.buildstack.domain.enums.SslStatus;
import com.buildstack.project.entity.Project;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "domains")
@Getter
@Setter
public class Domain {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, unique = true)
    private String hostname;

    @Column(name = "is_custom", nullable = false)
    private boolean custom;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private DomainVerificationStatus verificationStatus = DomainVerificationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "ssl_status", nullable = false)
    private SslStatus sslStatus = SslStatus.PENDING;

    @Column(name = "is_active", nullable = false)
    private boolean active = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
