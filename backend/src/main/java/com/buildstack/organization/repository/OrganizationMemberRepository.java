package com.buildstack.organization.repository;

import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, UUID> {
    
    boolean existsByOrganizationIdAndUserId(UUID organizationId, Long userId);
    
    Optional<OrganizationMember> findByOrganizationIdAndUserId(UUID organizationId, Long userId);
    
    List<OrganizationMember> findByOrganizationId(UUID organizationId);
    
    List<OrganizationMember> findByUserId(Long userId);
    
    long countByOrganizationIdAndRole(UUID organizationId, OrganizationRole role);
}
