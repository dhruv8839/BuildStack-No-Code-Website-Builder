package com.buildstack.domain.service;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.domain.entity.Domain;
import com.buildstack.domain.enums.DomainVerificationStatus;
import com.buildstack.domain.enums.SslStatus;
import com.buildstack.domain.exception.DomainException;
import com.buildstack.domain.provider.DnsVerificationProvider;
import com.buildstack.domain.provider.SslProvider;
import com.buildstack.domain.repository.DomainRepository;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Project;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DomainServiceTest {

    @Mock
    private DomainRepository domainRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private OrganizationMemberRepository memberRepository;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private DnsVerificationProvider dnsVerificationProvider;
    @Mock
    private SslProvider sslProvider;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private DomainService domainService;

    private Project project;

    @BeforeEach
    void setUp() {
        Organization org = new Organization();
        org.setId(UUID.randomUUID());

        Workspace workspace = new Workspace();
        workspace.setId(UUID.randomUUID());
        workspace.setOrganization(org);

        project = new Project();
        project.setId(UUID.randomUUID());
        project.setWorkspace(workspace);
    }

    @Test
    void createSubdomain_Success() {
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        OrganizationMember member = new OrganizationMember();
        member.setRole(OrganizationRole.ADMIN);
        when(memberRepository.findByOrganizationIdAndUserId(any(), any())).thenReturn(Optional.of(member));

        when(domainRepository.existsByHostname("mysite.buildstack.app")).thenReturn(false);
        when(domainRepository.save(any(Domain.class))).thenAnswer(i -> {
            Domain d = i.getArgument(0);
            d.setId(UUID.randomUUID());
            return d;
        });

        Domain domain = domainService.createSubdomain(project.getId(), "mysite");

        assertNotNull(domain.getId());
        assertEquals("mysite.buildstack.app", domain.getHostname());
        assertFalse(domain.isCustom());
        assertEquals(DomainVerificationStatus.VERIFIED, domain.getVerificationStatus());
        assertEquals(SslStatus.ACTIVE, domain.getSslStatus());
        assertTrue(domain.isActive());
    }
    
    @Test
    void createSubdomain_ReservedWord_ThrowsException() {
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(currentUserService.getCurrentUserId()).thenReturn(1L);
        OrganizationMember member = new OrganizationMember();
        member.setRole(OrganizationRole.ADMIN);
        when(memberRepository.findByOrganizationIdAndUserId(any(), any())).thenReturn(Optional.of(member));

        assertThrows(DomainException.class, () -> domainService.createSubdomain(project.getId(), "www"));
    }
}
