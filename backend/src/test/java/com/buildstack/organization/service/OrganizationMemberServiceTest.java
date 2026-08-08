package com.buildstack.organization.service;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.organization.dto.OrganizationMemberRequest;
import com.buildstack.organization.dto.OrganizationMemberResponse;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.mapper.OrganizationMemberMapper;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationMemberServiceTest {

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private OrganizationMemberMapper memberMapper;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private OrganizationMemberService memberService;

    private User ownerUser;
    private User memberUser;
    private Organization testOrg;
    private OrganizationMember ownerMember;
    private OrganizationMember targetMember;

    @BeforeEach
    void setUp() {
        ownerUser = TestFixtures.createTestUser(1L, "owner@test.com");
        memberUser = TestFixtures.createTestUser(2L, "member@test.com");
        testOrg = TestFixtures.createTestOrganization(UUID.randomUUID(), "org", ownerUser);

        ownerMember = TestFixtures.createTestMember(UUID.randomUUID(), testOrg, ownerUser, OrganizationRole.OWNER);
        targetMember = TestFixtures.createTestMember(UUID.randomUUID(), testOrg, memberUser, OrganizationRole.MEMBER);
    }

    @Test
    void shouldUpdateMemberRoleSuccessfully() {
        OrganizationMemberRequest req = new OrganizationMemberRequest(OrganizationRole.ADMIN);
        
        when(currentUserService.getCurrentUserId()).thenReturn(ownerUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), ownerUser.getId())).thenReturn(Optional.of(ownerMember));
        when(memberRepository.findById(targetMember.getId())).thenReturn(Optional.of(targetMember));
        when(memberRepository.save(any(OrganizationMember.class))).thenReturn(targetMember);

        OrganizationMemberResponse resp = new OrganizationMemberResponse(targetMember.getId(), testOrg.getId(), memberUser.getId(), memberUser.getEmail(), OrganizationRole.ADMIN, null, null, true);
        when(memberMapper.toResponse(targetMember)).thenReturn(resp);

        OrganizationMemberResponse result = memberService.updateMemberRole(testOrg.getId(), targetMember.getId(), req);

        assertThat(result.role()).isEqualTo(OrganizationRole.ADMIN);
        assertThat(targetMember.getRole()).isEqualTo(OrganizationRole.ADMIN);
    }

    @Test
    void shouldFailUpdateRoleWhenNotOwner() {
        OrganizationMemberRequest req = new OrganizationMemberRequest(OrganizationRole.ADMIN);
        
        when(currentUserService.getCurrentUserId()).thenReturn(memberUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), memberUser.getId())).thenReturn(Optional.of(targetMember));

        assertThrows(AccessDeniedException.class, () -> memberService.updateMemberRole(testOrg.getId(), targetMember.getId(), req));
    }

    @Test
    void shouldFailUpdateRoleWhenTargetIsOwner() {
        OrganizationMemberRequest req = new OrganizationMemberRequest(OrganizationRole.ADMIN);
        
        when(currentUserService.getCurrentUserId()).thenReturn(ownerUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), ownerUser.getId())).thenReturn(Optional.of(ownerMember));
        when(memberRepository.findById(ownerMember.getId())).thenReturn(Optional.of(ownerMember));

        assertThrows(BadRequestException.class, () -> memberService.updateMemberRole(testOrg.getId(), ownerMember.getId(), req));
    }

    @Test
    void shouldRemoveMemberSuccessfully() {
        when(currentUserService.getCurrentUserId()).thenReturn(ownerUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), ownerUser.getId())).thenReturn(Optional.of(ownerMember));
        when(memberRepository.findById(targetMember.getId())).thenReturn(Optional.of(targetMember));

        memberService.removeMember(testOrg.getId(), targetMember.getId());

        verify(memberRepository).delete(targetMember);
    }

    @Test
    void shouldFailRemoveOwner() {
        when(currentUserService.getCurrentUserId()).thenReturn(ownerUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), ownerUser.getId())).thenReturn(Optional.of(ownerMember));
        when(memberRepository.findById(ownerMember.getId())).thenReturn(Optional.of(ownerMember));

        assertThrows(BadRequestException.class, () -> memberService.removeMember(testOrg.getId(), ownerMember.getId()));
    }

    @Test
    void shouldLeaveOrganizationSuccessfully() {
        when(currentUserService.getCurrentUserId()).thenReturn(memberUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), memberUser.getId())).thenReturn(Optional.of(targetMember));

        memberService.leaveOrganization(testOrg.getId());

        verify(memberRepository).delete(targetMember);
    }

    @Test
    void shouldFailLeaveWhenOwner() {
        when(currentUserService.getCurrentUserId()).thenReturn(ownerUser.getId());
        when(memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), ownerUser.getId())).thenReturn(Optional.of(ownerMember));

        assertThrows(BadRequestException.class, () -> memberService.leaveOrganization(testOrg.getId()));
    }
}
