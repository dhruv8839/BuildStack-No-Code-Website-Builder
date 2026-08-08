package com.buildstack.organization.repository;

import com.buildstack.organization.entity.OrganizationInvitation;
import com.buildstack.organization.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationInvitationRepository extends JpaRepository<OrganizationInvitation, UUID> {
    
    Optional<OrganizationInvitation> findByToken(String token);
    
    boolean existsByToken(String token);
    
    boolean existsByOrganizationIdAndEmailAndStatusIn(UUID organizationId, String email, Collection<InvitationStatus> statuses);
    
    List<OrganizationInvitation> findByOrganizationId(UUID organizationId);
    
    List<OrganizationInvitation> findByOrganizationIdAndStatus(UUID organizationId, InvitationStatus status);
}
