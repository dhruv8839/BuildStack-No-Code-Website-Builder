package com.buildstack.domain.repository;

import com.buildstack.domain.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DomainRepository extends JpaRepository<Domain, UUID> {
    
    Optional<Domain> findByHostname(String hostname);
    
    List<Domain> findByProjectId(UUID projectId);
    
    boolean existsByHostname(String hostname);
}
