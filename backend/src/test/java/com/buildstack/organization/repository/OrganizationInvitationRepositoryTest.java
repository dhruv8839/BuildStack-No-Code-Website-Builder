package com.buildstack.organization.repository;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationInvitation;
import com.buildstack.organization.enums.InvitationStatus;
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
class OrganizationInvitationRepositoryTest extends TestBase {

    @Autowired
    private OrganizationInvitationRepository invitationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        invitationRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(TestFixtures.createTestUser(null, "invite@test.com"));
        testOrg = organizationRepository.save(TestFixtures.createTestOrganization(null, "invite-org", testUser));
    }

    @Test
    void shouldSaveInvitationSuccessfully() {
        OrganizationInvitation invitation = TestFixtures.createTestInvitation(null, testOrg, "guest@test.com", "TOKEN-123", testUser);

        OrganizationInvitation saved = invitationRepository.save(invitation);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getToken()).isEqualTo("TOKEN-123");
    }

    @Test
    void shouldFindInvitationByToken() {
        OrganizationInvitation invitation = TestFixtures.createTestInvitation(null, testOrg, "guest@test.com", "TOKEN-123", testUser);
        invitationRepository.save(invitation);

        Optional<OrganizationInvitation> found = invitationRepository.findByToken("TOKEN-123");

        assertThat(found).isPresent();
    }

    @Test
    void shouldCheckIfPendingInvitationExists() {
        OrganizationInvitation invitation = TestFixtures.createTestInvitation(null, testOrg, "guest@test.com", "TOKEN-123", testUser);
        invitationRepository.save(invitation);

        boolean exists = invitationRepository.existsByOrganizationIdAndEmailAndStatusIn(testOrg.getId(), "guest@test.com", List.of(InvitationStatus.PENDING));

        assertThat(exists).isTrue();
    }

    @Test
    void shouldFailWhenTokenIsDuplicate() {
        OrganizationInvitation inv1 = TestFixtures.createTestInvitation(null, testOrg, "guest1@test.com", "DUP-TOKEN", testUser);
        invitationRepository.saveAndFlush(inv1);

        OrganizationInvitation inv2 = TestFixtures.createTestInvitation(null, testOrg, "guest2@test.com", "DUP-TOKEN", testUser);

        assertThrows(DataIntegrityViolationException.class, () -> invitationRepository.saveAndFlush(inv2));
    }
}
