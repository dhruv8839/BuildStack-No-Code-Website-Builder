package com.buildstack.publishing.repository;

import com.buildstack.publishing.entity.FormSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, UUID> {

    /** Get all submissions for a project (newest first) */
    Page<FormSubmission> findByProjectIdOrderBySubmittedAtDesc(UUID projectId, Pageable pageable);

    /** Get all for CSV export */
    List<FormSubmission> findByProjectIdOrderBySubmittedAtDesc(UUID projectId);

    /** Count submissions for a project */
    long countByProjectId(UUID projectId);
}
