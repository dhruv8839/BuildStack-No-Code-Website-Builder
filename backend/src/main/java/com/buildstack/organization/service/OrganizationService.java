package com.buildstack.organization.service;

import com.buildstack.auth.entity.User;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.dto.OrganizationRequest;
import com.buildstack.organization.dto.OrganizationResponse;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.mapper.OrganizationMapper;
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
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final com.buildstack.organization.repository.OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationMapper organizationMapper;
    private final CurrentUserService currentUserService;

    @Transactional
    public OrganizationResponse createOrganization(OrganizationRequest request) {
        String slug = request.slug().trim().toLowerCase();
        if (organizationRepository.existsBySlug(slug)) {
            throw new BadRequestException("Organization with slug '" + slug + "' already exists");
        }

        User currentUser = currentUserService.getCurrentUser();
        Organization organization = organizationMapper.toEntity(request);
        organization.setCreatedBy(currentUser);

        Organization savedOrganization = organizationRepository.save(organization);

        com.buildstack.organization.entity.OrganizationMember member = new com.buildstack.organization.entity.OrganizationMember();
        member.setOrganization(savedOrganization);
        member.setUser(currentUser);
        member.setRole(com.buildstack.organization.enums.OrganizationRole.OWNER);
        member.setActive(true);
        organizationMemberRepository.save(member);

        return organizationMapper.toResponse(savedOrganization);
    }

    @Transactional
    public OrganizationResponse updateOrganization(UUID id, OrganizationRequest request) {
        Organization organization = findOrganizationOrThrow(id);
        verifyOwnership(organization);

        String slug = request.slug().trim().toLowerCase();
        if (!organization.getSlug().equals(slug) && organizationRepository.existsBySlug(slug)) {
            throw new BadRequestException("Organization with slug '" + slug + "' already exists");
        }

        organizationMapper.updateEntityFromRequest(request, organization);
        Organization updatedOrganization = organizationRepository.save(organization);
        return organizationMapper.toResponse(updatedOrganization);
    }

    @Transactional
    public void deleteOrganization(UUID id) {
        Organization organization = findOrganizationOrThrow(id);
        verifyOwnership(organization);
        organizationRepository.delete(organization);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationById(UUID id) {
        return organizationMapper.toResponse(findOrganizationOrThrow(id));
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationBySlug(String slug) {
        Organization organization = organizationRepository.findBySlug(slug.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with slug: " + slug));
        return organizationMapper.toResponse(organization);
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> getOrganizationsByCreator() {
        Long currentUserId = currentUserService.getCurrentUserId();
        return organizationMemberRepository.findByUserId(currentUserId).stream()
                .map(member -> organizationMapper.toResponse(member.getOrganization()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(organizationMapper::toResponse)
                .collect(Collectors.toList());
    }

    private Organization findOrganizationOrThrow(UUID id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with id: " + id));
    }

    private void verifyOwnership(Organization organization) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!organization.getCreatedBy().getId().equals(currentUserId)) {
            throw new AccessDeniedException("User is not authorized to perform this action.");
        }
    }
}
