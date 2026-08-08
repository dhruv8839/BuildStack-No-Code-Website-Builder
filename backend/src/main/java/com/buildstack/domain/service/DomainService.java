package com.buildstack.domain.service;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.domain.entity.Domain;
import com.buildstack.domain.enums.DomainVerificationStatus;
import com.buildstack.domain.enums.SslStatus;
import com.buildstack.domain.event.DomainVerifiedEvent;
import com.buildstack.domain.event.SSLActivatedEvent;
import com.buildstack.domain.exception.DomainException;
import com.buildstack.domain.provider.DnsVerificationProvider;
import com.buildstack.domain.provider.SslProvider;
import com.buildstack.domain.repository.DomainRepository;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class DomainService {

    private final DomainRepository domainRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final CurrentUserService currentUserService;
    private final DnsVerificationProvider dnsVerificationProvider;
    private final SslProvider sslProvider;
    private final ApplicationEventPublisher eventPublisher;

    private static final String BUILDSTACK_SUFFIX = ".buildstack.app";
    private static final Pattern SUBDOMAIN_PATTERN = Pattern.compile("^[a-z0-9-]+$");
    
    // Some basic reserved subdomains
    private static final List<String> RESERVED_SUBDOMAINS = List.of("www", "api", "admin", "app", "auth", "static");

    @Transactional
    public Domain createSubdomain(UUID projectId, String subdomainPrefix) {
        Project project = getProjectAndVerifyAccess(projectId);
        
        if (subdomainPrefix == null || subdomainPrefix.isBlank()) {
            throw new DomainException("Subdomain prefix cannot be empty.");
        }
        
        String normalizedPrefix = subdomainPrefix.toLowerCase().trim();
        
        if (!SUBDOMAIN_PATTERN.matcher(normalizedPrefix).matches()) {
            throw new DomainException("Subdomain can only contain lowercase letters, numbers, and hyphens.");
        }
        
        if (RESERVED_SUBDOMAINS.contains(normalizedPrefix)) {
            throw new DomainException("This subdomain is reserved and cannot be used.");
        }
        
        String fullHostname = normalizedPrefix + BUILDSTACK_SUFFIX;
        
        if (domainRepository.existsByHostname(fullHostname)) {
            throw new DomainException("Hostname " + fullHostname + " is already taken.");
        }
        
        Domain domain = new Domain();
        domain.setProject(project);
        domain.setHostname(fullHostname);
        domain.setCustom(false);
        // BuildStack subdomains are pre-verified and SSL is handled natively via wildcard in a real scenario
        domain.setVerificationStatus(DomainVerificationStatus.VERIFIED);
        domain.setSslStatus(SslStatus.ACTIVE);
        domain.setActive(true);
        
        return domainRepository.save(domain);
    }

    @Transactional
    public Domain createCustomDomain(UUID projectId, String hostname) {
        Project project = getProjectAndVerifyAccess(projectId);
        
        if (hostname == null || hostname.isBlank()) {
            throw new DomainException("Hostname cannot be empty.");
        }
        
        String normalizedHostname = hostname.toLowerCase().trim();
        
        if (normalizedHostname.endsWith(BUILDSTACK_SUFFIX)) {
            throw new DomainException("Cannot register a buildstack.app domain as a custom domain.");
        }
        
        if (domainRepository.existsByHostname(normalizedHostname)) {
            throw new DomainException("Hostname " + normalizedHostname + " is already registered.");
        }
        
        Domain domain = new Domain();
        domain.setProject(project);
        domain.setHostname(normalizedHostname);
        domain.setCustom(true);
        domain.setVerificationStatus(DomainVerificationStatus.PENDING);
        domain.setSslStatus(SslStatus.PENDING);
        domain.setActive(false);
        
        return domainRepository.save(domain);
    }

    @Transactional
    public Domain requestDnsVerification(UUID domainId) {
        Domain domain = getDomainAndVerifyAccess(domainId);
        
        if (!domain.isCustom()) {
            throw new DomainException("BuildStack subdomains do not require DNS verification.");
        }
        
        DomainVerificationStatus status = dnsVerificationProvider.verifyDomain(domain.getHostname());
        domain.setVerificationStatus(status);
        
        if (status == DomainVerificationStatus.VERIFIED) {
            domain.setActive(true);
            eventPublisher.publishEvent(new DomainVerifiedEvent(domain.getId(), domain.getProject().getId(), domain.getHostname()));
        }
        
        return domainRepository.save(domain);
    }

    @Transactional
    public Domain requestSslIssuance(UUID domainId) {
        Domain domain = getDomainAndVerifyAccess(domainId);
        
        if (!domain.isCustom()) {
            throw new DomainException("BuildStack subdomains have SSL managed automatically.");
        }
        
        if (domain.getVerificationStatus() != DomainVerificationStatus.VERIFIED) {
            throw new DomainException("Domain must be verified before SSL can be issued.");
        }
        
        SslStatus status = sslProvider.issueCertificate(domain.getHostname());
        domain.setSslStatus(status);
        
        if (status == SslStatus.ACTIVE) {
            eventPublisher.publishEvent(new SSLActivatedEvent(domain.getId(), domain.getProject().getId(), domain.getHostname()));
        }
        
        return domainRepository.save(domain);
    }
    
    public List<Domain> getDomainsForProject(UUID projectId) {
        getProjectAndVerifyAccess(projectId); // Just to verify access
        return domainRepository.findByProjectId(projectId);
    }

    private Project getProjectAndVerifyAccess(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        verifyAdminAccess(project.getWorkspace().getOrganization().getId());
        return project;
    }
    
    private Domain getDomainAndVerifyAccess(UUID domainId) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found"));
                
        verifyAdminAccess(domain.getProject().getWorkspace().getOrganization().getId());
        return domain;
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to manage domains.");
        }
    }
}
