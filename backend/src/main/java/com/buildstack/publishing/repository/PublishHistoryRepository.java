package com.buildstack.publishing.repository;

import com.buildstack.publishing.entity.PublishHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PublishHistoryRepository extends JpaRepository<PublishHistory, UUID> {
    List<PublishHistory> findByWebsiteVersionIdOrderByPublishedAtDesc(UUID websiteVersionId);
}
