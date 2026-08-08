package com.buildstack.publishing.repository;

import com.buildstack.publishing.entity.PublishJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PublishJobRepository extends JpaRepository<PublishJob, UUID> {
    List<PublishJob> findByWebsiteVersionIdOrderByStartedAtDesc(UUID websiteVersionId);
}
