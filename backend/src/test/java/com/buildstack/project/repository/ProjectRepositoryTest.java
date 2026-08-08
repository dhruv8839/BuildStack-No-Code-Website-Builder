package com.buildstack.project.repository;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.project.entity.Project;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProjectRepositoryTest extends TestBase {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Organization testOrg;
    private Workspace testWorkspace;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
        workspaceRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(TestFixtures.createTestUser(null, "test@project.com"));
        testOrg = organizationRepository.save(TestFixtures.createTestOrganization(null, "proj-org", testUser));
        testWorkspace = workspaceRepository.save(TestFixtures.createTestWorkspace(null, "PROJWS", testOrg));
    }

    @Test
    void shouldSaveProjectSuccessfully() {
        Project project = TestFixtures.createTestProject(null, testWorkspace, "My Site", "my-site");

        Project saved = projectRepository.save(project);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getSlug()).isEqualTo("my-site");
    }

    @Test
    void shouldFindAllByWorkspaceId() {
        Project p1 = TestFixtures.createTestProject(null, testWorkspace, "Site 1", "site-1");
        Project p2 = TestFixtures.createTestProject(null, testWorkspace, "Site 2", "site-2");
        projectRepository.saveAll(List.of(p1, p2));

        List<Project> projects = projectRepository.findAllByWorkspaceId(testWorkspace.getId());

        assertThat(projects).hasSize(2);
    }

    @Test
    void shouldCheckIfExistsByWorkspaceIdAndSlug() {
        Project project = TestFixtures.createTestProject(null, testWorkspace, "My Site", "my-site");
        projectRepository.save(project);

        boolean exists = projectRepository.existsByWorkspaceIdAndSlug(testWorkspace.getId(), "my-site");
        boolean notExists = projectRepository.existsByWorkspaceIdAndSlug(testWorkspace.getId(), "other-site");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    void shouldFailWhenSlugIsDuplicateInSameWorkspace() {
        Project p1 = TestFixtures.createTestProject(null, testWorkspace, "Site 1", "dup-slug");
        projectRepository.saveAndFlush(p1);

        Project p2 = TestFixtures.createTestProject(null, testWorkspace, "Site 2", "dup-slug");

        assertThrows(DataIntegrityViolationException.class, () -> projectRepository.saveAndFlush(p2));
    }
}
