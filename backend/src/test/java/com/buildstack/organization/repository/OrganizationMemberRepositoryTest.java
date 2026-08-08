package com.buildstack.organization.repository;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OrganizationMemberRepositoryTest extends TestBase {

    @Autowired
    private OrganizationMemberRepository memberRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        memberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(TestFixtures.createTestUser(null, "member@test.com"));
        testOrg = organizationRepository.save(TestFixtures.createTestOrganization(null, "member-org", testUser));
    }

    @Test
    void shouldSaveMemberSuccessfully() {
        OrganizationMember member = TestFixtures.createTestMember(null, testOrg, testUser, OrganizationRole.OWNER);

        OrganizationMember saved = memberRepository.save(member);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getRole()).isEqualTo(OrganizationRole.OWNER);
    }

    @Test
    void shouldFindMemberByOrganizationAndUser() {
        OrganizationMember member = TestFixtures.createTestMember(null, testOrg, testUser, OrganizationRole.OWNER);
        memberRepository.save(member);

        Optional<OrganizationMember> found = memberRepository.findByOrganizationIdAndUserId(testOrg.getId(), testUser.getId());

        assertThat(found).isPresent();
    }

    @Test
    void shouldFailWhenUserIsDuplicatedInOrganization() {
        OrganizationMember member1 = TestFixtures.createTestMember(null, testOrg, testUser, OrganizationRole.OWNER);
        memberRepository.saveAndFlush(member1);

        OrganizationMember member2 = TestFixtures.createTestMember(null, testOrg, testUser, OrganizationRole.MEMBER);

        assertThrows(DataIntegrityViolationException.class, () -> memberRepository.saveAndFlush(member2));
    }
}
