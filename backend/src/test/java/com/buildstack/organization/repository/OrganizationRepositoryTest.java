package com.buildstack.organization.repository;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OrganizationRepositoryTest extends TestBase {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        User user = TestFixtures.createTestUser(null, "test@test.com");
        testUser = userRepository.save(user);
    }

    @Test
    void shouldSaveOrganizationSuccessfully() {
        Organization org = TestFixtures.createTestOrganization(null, "my-org", testUser);

        Organization savedOrg = organizationRepository.save(org);

        assertThat(savedOrg.getId()).isNotNull();
        assertThat(savedOrg.getSlug()).isEqualTo("my-org");
        assertThat(savedOrg.getCreatedBy().getId()).isEqualTo(testUser.getId());
    }

    @Test
    void shouldFindOrganizationBySlug() {
        Organization org = TestFixtures.createTestOrganization(null, "search-org", testUser);
        organizationRepository.save(org);

        Optional<Organization> found = organizationRepository.findBySlug("search-org");

        assertThat(found).isPresent();
        assertThat(found.get().getSlug()).isEqualTo("search-org");
    }

    @Test
    void shouldCheckIfSlugExists() {
        Organization org = TestFixtures.createTestOrganization(null, "exists-org", testUser);
        organizationRepository.save(org);

        boolean exists = organizationRepository.existsBySlug("exists-org");
        boolean notExists = organizationRepository.existsBySlug("does-not-exist");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldFindAllByCreatedById() {
        Organization org1 = TestFixtures.createTestOrganization(null, "org1", testUser);
        Organization org2 = TestFixtures.createTestOrganization(null, "org2", testUser);
        organizationRepository.saveAll(List.of(org1, org2));

        List<Organization> orgs = organizationRepository.findAllByCreatedById(testUser.getId());

        assertThat(orgs).hasSize(2);
    }

    @Test
    void shouldFailWhenSlugIsDuplicate() {
        Organization org1 = TestFixtures.createTestOrganization(null, "duplicate", testUser);
        organizationRepository.saveAndFlush(org1);

        Organization org2 = TestFixtures.createTestOrganization(null, "duplicate", testUser);
        
        assertThrows(DataIntegrityViolationException.class, () -> organizationRepository.saveAndFlush(org2));
    }
}
