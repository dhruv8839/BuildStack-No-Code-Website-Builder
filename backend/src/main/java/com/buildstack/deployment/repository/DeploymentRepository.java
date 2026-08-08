package com.buildstack.deployment.repository;

import com.buildstack.deployment.entity.Deployment;
import com.buildstack.deployment.enums.DeploymentStatus;
import com.buildstack.deployment.enums.DeploymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeploymentRepository extends JpaRepository<Deployment, UUID> {
    
    Optional<Deployment> findByProjectIdAndTypeAndStatus(UUID projectId, DeploymentType type, DeploymentStatus status);
    
    List<Deployment> findByProjectIdOrderByStartedAtDesc(UUID projectId);
    
    List<Deployment> findByTypeAndStatusAndExpiresAtBefore(DeploymentType type, DeploymentStatus status, Instant now);
}
