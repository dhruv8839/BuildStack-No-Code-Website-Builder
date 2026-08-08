package com.buildstack.publishing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "cache_metadata")
@Getter
@Setter
public class CacheMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artifact_metadata_id", nullable = false)
    private ArtifactMetadata artifactMetadata;

    @Column(name = "cache_headers", columnDefinition = "TEXT")
    private String cacheHeaders; // JSON mapping of path to Cache-Control header

    @Column(name = "invalidation_paths", columnDefinition = "TEXT")
    private String invalidationPaths; // Comma-separated or JSON list of paths to invalidate

    @Column(name = "immutable_assets", columnDefinition = "TEXT")
    private String immutableAssets; // JSON array of hashed asset paths
}
