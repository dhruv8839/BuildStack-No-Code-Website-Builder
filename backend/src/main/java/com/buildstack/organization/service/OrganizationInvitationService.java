package com.buildstack.organization.service;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.dto.InvitationRequest;
import com.buildstack.organization.dto.InvitationResponse;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationInvitation;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.InvitationStatus;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.mapper.OrganizationInvitationMapper;
import com.buildstack.organization.repository.OrganizationInvitationRepository;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationInvitationService {

    private final OrganizationInvitationRepository organizationInvitationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final OrganizationInvitationMapper organizationInvitationMapper;
    private final CurrentUserService currentUserService;

    @Transactional
    public InvitationResponse invite(UUID organizationId, InvitationRequest request) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember currentMember = organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization."));

        if (currentMember.getRole() == OrganizationRole.MEMBER) {
            throw new AccessDeniedException("Only OWNER and ADMIN may invite members.");
        }
        
        if (request.role() == OrganizationRole.OWNER && currentMember.getRole() != OrganizationRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can invite another OWNER.");
        }

        Organization organization = currentMember.getOrganization();

        // Check if user is already a member
        userRepository.findByEmail(request.email()).ifPresent(user -> {
            if (organizationMemberRepository.existsByOrganizationIdAndUserId(organizationId, user.getId())) {
                throw new BadRequestException("User is already a member of this organization.");
            }
        });

        // Check for duplicate pending invitations
        if (organizationInvitationRepository.existsByOrganizationIdAndEmailAndStatusIn(
                organizationId, request.email(), List.of(InvitationStatus.PENDING))) {
            throw new BadRequestException("A pending invitation already exists for this email.");
        }

        OrganizationInvitation invitation = OrganizationInvitation.builder()
                .organization(organization)
                .email(request.email())
                .role(request.role())
                .token(UUID.randomUUID().toString())
                .status(InvitationStatus.PENDING)
                .invitedBy(currentMember.getUser())
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        return organizationInvitationMapper.toResponse(organizationInvitationRepository.save(invitation));
    }

    @Transactional
    public void accept(String token) {
        OrganizationInvitation invitation = findValidInvitationOrThrow(token);
        User currentUser = currentUserService.getCurrentUser();

        if (!invitation.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new AccessDeniedException("You cannot accept an invitation sent to another email address.");
        }

        if (organizationMemberRepository.existsByOrganizationIdAndUserId(invitation.getOrganization().getId(), currentUser.getId())) {
            throw new BadRequestException("You are already a member of this organization.");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(LocalDateTime.now());
        organizationInvitationRepository.save(invitation);

        OrganizationMember newMember = OrganizationMember.builder()
                .organization(invitation.getOrganization())
                .user(currentUser)
                .role(invitation.getRole())
                .invitedBy(invitation.getInvitedBy())
                .joinedAt(LocalDateTime.now())
                .active(true)
                .build();

        organizationMemberRepository.save(newMember);
    }

    @Transactional
    public void decline(String token) {
        OrganizationInvitation invitation = findValidInvitationOrThrow(token);
        User currentUser = currentUserService.getCurrentUser();

        if (!invitation.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new AccessDeniedException("You cannot decline an invitation sent to another email address.");
        }

        invitation.setStatus(InvitationStatus.DECLINED);
        organizationInvitationRepository.save(invitation);
    }

    @Transactional
    public void cancel(UUID organizationId, UUID invitationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember currentMember = organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization."));

        if (currentMember.getRole() == OrganizationRole.MEMBER) {
            throw new AccessDeniedException("Only OWNER and ADMIN may cancel invitations.");
        }

        OrganizationInvitation invitation = organizationInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found."));

        if (!invitation.getOrganization().getId().equals(organizationId)) {
            throw new BadRequestException("Invitation does not belong to this organization.");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Only pending invitations can be cancelled.");
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        organizationInvitationRepository.save(invitation);
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> getPendingInvitations(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember currentMember = organizationMemberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization."));

        if (currentMember.getRole() == OrganizationRole.MEMBER) {
            throw new AccessDeniedException("Only OWNER and ADMIN may view invitations.");
        }

        return organizationInvitationRepository.findByOrganizationIdAndStatus(organizationId, InvitationStatus.PENDING).stream()
                .map(organizationInvitationMapper::toResponse)
                .collect(Collectors.toList());
    }

    private OrganizationInvitation findValidInvitationOrThrow(String token) {
        OrganizationInvitation invitation = organizationInvitationRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BadRequestException("Invitation is no longer valid (Status: " + invitation.getStatus() + ").");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            organizationInvitationRepository.save(invitation);
            throw new BadRequestException("Invitation has expired.");
        }

        return invitation;
    }
}
