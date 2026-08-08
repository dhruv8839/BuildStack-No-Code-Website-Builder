package com.buildstack.publishing.repository;

import com.buildstack.publishing.entity.ArtifactMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ArtifactMetadataRepository extends JpaRepository<ArtifactMetadata, UUID> {
    Optional<ArtifactMetadata> findByPublishHistoryId(UUID publishHistoryId);
    
    @org.springframework.data.jpa.repository.Query("SELECT a FROM ArtifactMetadata a JOIN a.publishHistory ph JOIN ph.websiteVersion w WHERE w.project.id = :projectId ORDER BY a.createdAt DESC")
    java.util.List<ArtifactMetadata> findByProjectIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("projectId") UUID projectId);
}
