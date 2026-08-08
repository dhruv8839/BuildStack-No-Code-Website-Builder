package com.buildstack.organization.service;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.dto.OrganizationMemberRequest;
import com.buildstack.organization.dto.OrganizationMemberResponse;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.mapper.OrganizationMemberMapper;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationMemberService {

    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberMapper organizationMemberMapper;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<OrganizationMemberResponse> getMembers(UUID organizationId) {
        verifyMembership(organizationId);
        return organizationMemberRepository.findByOrganizationId(organizationId).stream()
                .map(organizationMemberMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrganizationMemberResponse updateMemberRole(UUID organizationId, UUID memberId, OrganizationMemberRequest request) {
        OrganizationMember currentMember = verifyMembership(organizationId);
        if (currentMember.getRole() != OrganizationRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can update member roles.");
        }

        OrganizationMember targetMember = organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!targetMember.getOrganization().getId().equals(organizationId)) {
            throw new BadRequestException("Member does not belong to this organization.");
        }

        if (targetMember.getRole() == OrganizationRole.OWNER) {
            throw new BadRequestException("Cannot change the role of the organization owner.");
        }

        targetMember.setRole(request.role());
        return organizationMemberMapper.toResponse(organizationMemberRepository.save(targetMember));
    }

    @Transactional
    public void removeMember(UUID organizationId, UUID memberId) {
        OrganizationMember currentMember = verifyMembership(organizationId);
        if (currentMember.getRole() != OrganizationRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can remove members.");
        }

        OrganizationMember targetMember = organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (!targetMember.getOrganization().getId().equals(organizationId)) {
            throw new BadRequestException("Member does not belong to this organization.");
        }

        if (targetMember.getRole() == OrganizationRole.OWNER) {
            throw new BadRequestException("Owner cannot be removed.");
        }

        organizationMemberRepository.delete(targetMember);
    }

    @Transactional
    public void leaveOrganization(UUID organizationId) {
        OrganizationMember currentMember = verifyMembership(organizationId);
        
        if (currentMember.getRole() == OrganizationRole.OWNER) {
            throw new BadRequestException("Owner cannot leave the organization.");
        }

        organizationMemberRepository.delete(currentMember);
    }

    public OrganizationMember verifyMembership(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        return organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization."));
    }
}
