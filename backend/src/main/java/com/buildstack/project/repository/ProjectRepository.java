package com.buildstack.project.repository;

import com.buildstack.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findAllByWorkspaceId(UUID workspaceId);
    boolean existsByWorkspaceIdAndSlug(UUID workspaceId, String slug);
}
