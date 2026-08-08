package com.buildstack.organization.repository;

import com.buildstack.organization.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {

    List<Workspace> findAllByOrganizationId(UUID organizationId);

    Optional<Workspace> findByOrganizationIdAndKey(UUID organizationId, String key);

    boolean existsByOrganizationIdAndKey(UUID organizationId, String key);
}
