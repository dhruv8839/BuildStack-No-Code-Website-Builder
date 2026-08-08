package com.buildstack.project.repository;

import com.buildstack.project.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PageRepository extends JpaRepository<Page, UUID> {
    List<Page> findAllByProjectId(UUID projectId);
    Optional<Page> findByProjectIdAndSlug(UUID projectId, String slug);
    boolean existsByProjectIdAndSlug(UUID projectId, String slug);
    Optional<Page> findByProjectIdAndIsHomePageTrue(UUID projectId);
}
