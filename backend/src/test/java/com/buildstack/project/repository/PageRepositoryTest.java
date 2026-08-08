package com.buildstack.project.repository;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.project.entity.Page;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import com.buildstack.component.entity.Component;
import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.repository.ComponentRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PageRepositoryTest extends TestBase {

    @Autowired
    private PageRepository pageRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComponentRepository componentRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Project testProject;

    @BeforeEach
    void setUp() {
        pageRepository.deleteAll();
        projectRepository.deleteAll();
        workspaceRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        User testUser = userRepository.save(TestFixtures.createTestUser(null, "test@page.com"));
        Organization testOrg = organizationRepository.save(TestFixtures.createTestOrganization(null, "page-org", testUser));
        Workspace testWorkspace = workspaceRepository.save(TestFixtures.createTestWorkspace(null, "PAGEWS", testOrg));
        testProject = projectRepository.save(TestFixtures.createTestProject(null, testWorkspace, "Page Proj", "page-proj"));
    }

    @Test
    void shouldSavePageSuccessfully() {
        Page page = TestFixtures.createTestPage(null, testProject, "Home", "home");
        Page saved = pageRepository.save(page);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getSlug()).isEqualTo("home");
    }

    @Test
    void shouldFailWhenSlugIsDuplicateInSameProject() {
        Page p1 = TestFixtures.createTestPage(null, testProject, "Page 1", "dup");
        pageRepository.saveAndFlush(p1);

        Page p2 = TestFixtures.createTestPage(null, testProject, "Page 2", "dup");
        assertThrows(DataIntegrityViolationException.class, () -> pageRepository.saveAndFlush(p2));
    }

    @Test
    void shouldFindHomePage() {
        Page p1 = TestFixtures.createTestPage(null, testProject, "Page 1", "p1");
        p1.setHomePage(true);
        pageRepository.save(p1);

        Optional<Page> homePage = pageRepository.findByProjectIdAndIsHomePageTrue(testProject.getId());

        assertThat(homePage).isPresent();
        assertThat(homePage.get().getSlug()).isEqualTo("p1");
    }

    @Test
    void shouldDeleteAllComponentsWhenPageIsDeleted() {
        Page page = TestFixtures.createTestPage(null, testProject, "Test Page", "test");
        Page savedPage = pageRepository.save(page);

        Component root = TestFixtures.createTestComponent(null, savedPage, null, ComponentType.CONTAINER, 0);
        Component savedRoot = componentRepository.save(root);

        Component child = TestFixtures.createTestComponent(null, savedPage, savedRoot, ComponentType.TEXT, 0);
        Component savedChild = componentRepository.save(child);

        entityManager.flush();
        entityManager.clear();

        pageRepository.deleteById(savedPage.getId());
        entityManager.flush();

        assertThat(pageRepository.findById(savedPage.getId())).isEmpty();
        assertThat(componentRepository.findById(savedRoot.getId())).isEmpty();
        assertThat(componentRepository.findById(savedChild.getId())).isEmpty();
    }
}
