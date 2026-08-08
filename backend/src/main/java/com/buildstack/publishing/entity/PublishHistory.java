package com.buildstack.publishing.entity;

import com.buildstack.auth.entity.User;
import com.buildstack.publishing.enums.PublishResult;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "publish_histories")
@Getter
@Setter
public class PublishHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "website_version_id", nullable = false)
    private WebsiteVersion websiteVersion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PublishResult result;

    @OneToOne(mappedBy = "publishHistory", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true)
    private ArtifactMetadata artifactMetadata;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;
}
