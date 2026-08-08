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
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationInvitationServiceTest {

    @Mock
    private OrganizationInvitationRepository invitationRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationInvitationMapper invitationMapper;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private OrganizationInvitationService invitationService;

    private User ownerUser;
    private User invitedUser;
    private Organization testOrg;
    private OrganizationMember ownerMember;
    private OrganizationInvitation pendingInvitation;

    @BeforeEach
    void setUp() {
        ownerUser = TestFixtures.createTestUser(1L, "owner@test.com");
        invitedUser = TestFixtures.createTestUser(2L, "guest@test.com");
        testOrg = TestFixtures.createTestOrganization(UUID.randomUUID(), "org", ownerUser);

        ownerMember = TestFixtures.createTestMember(UUID.randomUUID(), testOrg, ownerUser, OrganizationRole.OWNER);
        pendingInvitation = TestFixtures.createTestInvitation(UUID.randomUUID(), testOrg, "guest@test.com", "TOKEN-123", ownerUser);
    }

    @Test
    void shouldInviteSuccessfully() {
        InvitationRequest req = new InvitationRequest("guest@test.com", OrganizationRole.MEMBER);
        
        when(currentUserService.getCurrentUserId()).thenReturn(ownerUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), ownerUser.getId())).thenReturn(Optional.of(ownerMember));
        when(userRepository.findByEmail("guest@test.com")).thenReturn(Optional.empty());
        when(invitationRepository.existsByOrganizationIdAndEmailAndStatusIn(testOrg.getId(), "guest@test.com", List.of(InvitationStatus.PENDING))).thenReturn(false);
        when(invitationRepository.save(any(OrganizationInvitation.class))).thenReturn(pendingInvitation);
        
        InvitationResponse resp = new InvitationResponse(pendingInvitation.getId(), testOrg.getId(), "guest@test.com", OrganizationRole.MEMBER, InvitationStatus.PENDING, ownerUser.getId(), null, null, null);
        when(invitationMapper.toResponse(pendingInvitation)).thenReturn(resp);

        InvitationResponse result = invitationService.invite(testOrg.getId(), req);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(InvitationStatus.PENDING);
        verify(invitationRepository).save(any(OrganizationInvitation.class));
    }

    @Test
    void shouldFailInviteWhenAlreadyMember() {
        InvitationRequest req = new InvitationRequest("guest@test.com", OrganizationRole.MEMBER);
        
        when(currentUserService.getCurrentUserId()).thenReturn(ownerUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), ownerUser.getId())).thenReturn(Optional.of(ownerMember));
        when(userRepository.findByEmail("guest@test.com")).thenReturn(Optional.of(invitedUser));
        when(memberRepository.existsByOrganizationIdAndUserId(testOrg.getId(), invitedUser.getId())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> invitationService.invite(testOrg.getId(), req));
    }

    @Test
    void shouldFailInviteWhenMemberRoleInvites() {
        OrganizationMember memberTier = TestFixtures.createTestMember(UUID.randomUUID(), testOrg, invitedUser, OrganizationRole.MEMBER);
        InvitationRequest req = new InvitationRequest("guest3@test.com", OrganizationRole.MEMBER);
        
        when(currentUserService.getCurrentUserId()).thenReturn(invitedUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), invitedUser.getId())).thenReturn(Optional.of(memberTier));

        assertThrows(AccessDeniedException.class, () -> invitationService.invite(testOrg.getId(), req));
    }

    @Test
    void shouldAcceptInvitationSuccessfully() {
        when(invitationRepository.findByToken("TOKEN-123")).thenReturn(Optional.of(pendingInvitation));
        when(currentUserService.getCurrentUser()).thenReturn(invitedUser);
        when(memberRepository.existsByOrganizationIdAndUserId(testOrg.getId(), invitedUser.getId())).thenReturn(false);

        invitationService.accept("TOKEN-123");

        assertThat(pendingInvitation.getStatus()).isEqualTo(InvitationStatus.ACCEPTED);
        verify(invitationRepository).save(pendingInvitation);
        verify(memberRepository).save(any(OrganizationMember.class));
    }

    @Test
    void shouldFailAcceptWhenWrongEmail() {
        User wrongUser = TestFixtures.createTestUser(3L, "wrong@test.com");
        when(invitationRepository.findByToken("TOKEN-123")).thenReturn(Optional.of(pendingInvitation));
        when(currentUserService.getCurrentUser()).thenReturn(wrongUser);

        assertThrows(AccessDeniedException.class, () -> invitationService.accept("TOKEN-123"));
    }

    @Test
    void shouldFailAcceptWhenExpired() {
        pendingInvitation.setExpiresAt(LocalDateTime.now().minusDays(1));
        when(invitationRepository.findByToken("TOKEN-123")).thenReturn(Optional.of(pendingInvitation));

        assertThrows(BadRequestException.class, () -> invitationService.accept("TOKEN-123"));
        assertThat(pendingInvitation.getStatus()).isEqualTo(InvitationStatus.EXPIRED);
    }

    @Test
    void shouldDeclineInvitationSuccessfully() {
        when(invitationRepository.findByToken("TOKEN-123")).thenReturn(Optional.of(pendingInvitation));
        when(currentUserService.getCurrentUser()).thenReturn(invitedUser);

        invitationService.decline("TOKEN-123");

        assertThat(pendingInvitation.getStatus()).isEqualTo(InvitationStatus.DECLINED);
        verify(invitationRepository).save(pendingInvitation);
    }
}
