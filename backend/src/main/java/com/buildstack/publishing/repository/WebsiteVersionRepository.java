package com.buildstack.publishing.repository;

import com.buildstack.publishing.entity.WebsiteVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebsiteVersionRepository extends JpaRepository<WebsiteVersion, UUID> {
    List<WebsiteVersion> findByProjectIdOrderByVersionNumberDesc(UUID projectId);
    
    Optional<WebsiteVersion> findTopByProjectIdOrderByVersionNumberDesc(UUID projectId);
}
