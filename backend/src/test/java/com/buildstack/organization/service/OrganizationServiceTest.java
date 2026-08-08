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
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;
    
    @Mock
    private com.buildstack.organization.repository.OrganizationMemberRepository organizationMemberRepository;

    @Mock
    private OrganizationMapper organizationMapper;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private OrganizationService organizationService;

    private User testUser;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        testUser = TestFixtures.createTestUser(1L, "test@test.com");
        testOrg = TestFixtures.createTestOrganization(UUID.randomUUID(), "my-org", testUser);
    }

    @Test
    void shouldCreateOrganizationSuccessfully() {
        OrganizationRequest req = new OrganizationRequest("My Org", "my-org", "Desc", null);
        when(organizationRepository.existsBySlug("my-org")).thenReturn(false);
        when(currentUserService.getCurrentUser()).thenReturn(testUser);
        
        Organization mapped = TestFixtures.createTestOrganization(null, "my-org", testUser);
        when(organizationMapper.toEntity(req)).thenReturn(mapped);
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrg);
        
        OrganizationResponse resp = new OrganizationResponse(testOrg.getId(), "My Org", "my-org", "Desc", null, testUser.getId(), null, null);
        when(organizationMapper.toResponse(testOrg)).thenReturn(resp);

        OrganizationResponse result = organizationService.createOrganization(req);

        assertThat(result).isNotNull();
        assertThat(result.slug()).isEqualTo("my-org");
        verify(organizationRepository).save(any(Organization.class));
    }

    @Test
    void shouldFailCreateWhenSlugExists() {
        OrganizationRequest req = new OrganizationRequest("My Org", "my-org", "Desc", null);
        when(organizationRepository.existsBySlug("my-org")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> organizationService.createOrganization(req));
    }

    @Test
    void shouldUpdateOrganizationSuccessfully() {
        OrganizationRequest req = new OrganizationRequest("New Name", "new-slug", "New Desc", null);
        when(organizationRepository.findById(testOrg.getId())).thenReturn(Optional.of(testOrg));
        when(currentUserService.getCurrentUserId()).thenReturn(testUser.getId());
        when(organizationRepository.existsBySlug("new-slug")).thenReturn(false);
        when(organizationRepository.save(any(Organization.class))).thenReturn(testOrg);

        OrganizationResponse resp = new OrganizationResponse(testOrg.getId(), "New Name", "new-slug", "New Desc", null, testUser.getId(), null, null);
        when(organizationMapper.toResponse(testOrg)).thenReturn(resp);

        OrganizationResponse result = organizationService.updateOrganization(testOrg.getId(), req);

        assertThat(result).isNotNull();
        verify(organizationRepository).save(any(Organization.class));
    }

    @Test
    void shouldFailUpdateWhenUserNotOwner() {
        OrganizationRequest req = new OrganizationRequest("New Name", "new-slug", "New Desc", null);
        when(organizationRepository.findById(testOrg.getId())).thenReturn(Optional.of(testOrg));
        when(currentUserService.getCurrentUserId()).thenReturn(999L); // Wrong user

        assertThrows(AccessDeniedException.class, () -> organizationService.updateOrganization(testOrg.getId(), req));
    }

    @Test
    void shouldFailUpdateWhenOrganizationNotFound() {
        OrganizationRequest req = new OrganizationRequest("New Name", "new-slug", "New Desc", null);
        when(organizationRepository.findById(testOrg.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> organizationService.updateOrganization(testOrg.getId(), req));
    }

    @Test
    void shouldDeleteOrganizationSuccessfully() {
        when(organizationRepository.findById(testOrg.getId())).thenReturn(Optional.of(testOrg));
        when(currentUserService.getCurrentUserId()).thenReturn(testUser.getId());

        organizationService.deleteOrganization(testOrg.getId());

        verify(organizationRepository).delete(testOrg);
    }
}
