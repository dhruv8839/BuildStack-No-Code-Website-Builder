package com.buildstack.organization.repository;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class WorkspaceRepositoryTest extends TestBase {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Organization testOrg;

    @BeforeEach
    void setUp() {
        workspaceRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(TestFixtures.createTestUser(null, "test@workspace.com"));
        testOrg = organizationRepository.save(TestFixtures.createTestOrganization(null, "ws-org", testUser));
    }

    @Test
    void shouldSaveWorkspaceSuccessfully() {
        Workspace ws = TestFixtures.createTestWorkspace(null, "KEY1", testOrg);

        Workspace saved = workspaceRepository.save(ws);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getKey()).isEqualTo("KEY1");
    }

    @Test
    void shouldFindAllByOrganizationId() {
        Workspace ws1 = TestFixtures.createTestWorkspace(null, "KEY1", testOrg);
        Workspace ws2 = TestFixtures.createTestWorkspace(null, "KEY2", testOrg);
        workspaceRepository.saveAll(List.of(ws1, ws2));

        List<Workspace> workspaces = workspaceRepository.findAllByOrganizationId(testOrg.getId());

        assertThat(workspaces).hasSize(2);
    }

    @Test
    void shouldCheckIfExistsByOrganizationIdAndKey() {
        Workspace ws = TestFixtures.createTestWorkspace(null, "KEY1", testOrg);
        workspaceRepository.save(ws);

        boolean exists = workspaceRepository.existsByOrganizationIdAndKey(testOrg.getId(), "KEY1");
        boolean notExists = workspaceRepository.existsByOrganizationIdAndKey(testOrg.getId(), "KEY2");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldFailWhenKeyIsDuplicateInSameOrganization() {
        Workspace ws1 = TestFixtures.createTestWorkspace(null, "DUP", testOrg);
        workspaceRepository.saveAndFlush(ws1);

        Workspace ws2 = TestFixtures.createTestWorkspace(null, "DUP", testOrg);

        assertThrows(DataIntegrityViolationException.class, () -> workspaceRepository.saveAndFlush(ws2));
    }
}
