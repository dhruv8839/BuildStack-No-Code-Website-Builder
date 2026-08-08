package com.buildstack.component.repository;

import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.component.entity.Component;
import com.buildstack.component.enums.ComponentType;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.project.entity.Page;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.PageRepository;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ComponentRepositoryTest extends TestBase {

    @Autowired
    private ComponentRepository componentRepository;
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
    private TestEntityManager entityManager;

    private Page testPage;

    @BeforeEach
    void setUp() {
        componentRepository.deleteAll();
        pageRepository.deleteAll();
        projectRepository.deleteAll();
        workspaceRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        User user = userRepository.save(TestFixtures.createTestUser(null, "comp@test.com"));
        Organization org = organizationRepository.save(TestFixtures.createTestOrganization(null, "comp-org", user));
        Workspace ws = workspaceRepository.save(TestFixtures.createTestWorkspace(null, "CWS", org));
        Project project = projectRepository.save(TestFixtures.createTestProject(null, ws, "Comp Proj", "c-proj"));
        testPage = pageRepository.save(TestFixtures.createTestPage(null, project, "Home", "home"));
    }

    @Test
    void shouldSaveAndRetrieveComponentsInOrder() {
        Component root = TestFixtures.createTestComponent(null, testPage, null, ComponentType.CONTAINER, 0);
        root.getProps().put("backgroundColor", "#fff");
        Component savedRoot = componentRepository.save(root);

        Component child2 = TestFixtures.createTestComponent(null, testPage, savedRoot, ComponentType.TEXT, 1);
        Component child1 = TestFixtures.createTestComponent(null, testPage, savedRoot, ComponentType.IMAGE, 0);
        componentRepository.save(child2);
        componentRepository.save(child1);

        List<Component> components = componentRepository.findAllByPageIdOrderByOrderIndexAsc(testPage.getId());

        assertThat(components).hasSize(3);
        
        List<Component> children = componentRepository.findAllByParentIdOrderByOrderIndexAsc(savedRoot.getId());
        assertThat(children).hasSize(2);
        assertThat(children.get(0).getType()).isEqualTo(ComponentType.IMAGE); // Order 0
        assertThat(children.get(1).getType()).isEqualTo(ComponentType.TEXT); // Order 1
    }

    @Test
    void shouldDeleteParentAndDirectChildren() {
        // Case 1: Delete a parent component with children.
        Component root = TestFixtures.createTestComponent(null, testPage, null, ComponentType.CONTAINER, 0);
        Component savedRoot = componentRepository.save(root);

        Component child1 = TestFixtures.createTestComponent(null, testPage, savedRoot, ComponentType.TEXT, 0);
        Component child2 = TestFixtures.createTestComponent(null, testPage, savedRoot, ComponentType.IMAGE, 1);
        
        child1 = componentRepository.save(child1);
        child2 = componentRepository.save(child2);
        
        entityManager.flush();
        entityManager.clear(); // Clear L1 cache so deleteById fetches children fresh

        // Perform deletion
        componentRepository.deleteById(savedRoot.getId());
        entityManager.flush();

        // Verify root and children are gone
        assertThat(componentRepository.findById(savedRoot.getId())).isEmpty();
        assertThat(componentRepository.findById(child1.getId())).isEmpty();
        assertThat(componentRepository.findById(child2.getId())).isEmpty();
    }

    @Test
    void shouldDeleteDeeplyNestedTree() {
        // Case 2: Delete a deeply nested tree. (Container -> Container -> Container -> Text)
        Component root = TestFixtures.createTestComponent(null, testPage, null, ComponentType.CONTAINER, 0);
        Component savedRoot = componentRepository.save(root);

        Component level1 = TestFixtures.createTestComponent(null, testPage, savedRoot, ComponentType.CONTAINER, 0);
        Component savedLevel1 = componentRepository.save(level1);

        Component level2 = TestFixtures.createTestComponent(null, testPage, savedLevel1, ComponentType.CONTAINER, 0);
        Component savedLevel2 = componentRepository.save(level2);

        Component leaf = TestFixtures.createTestComponent(null, testPage, savedLevel2, ComponentType.TEXT, 0);
        Component savedLeaf = componentRepository.save(leaf);
        
        entityManager.flush();
        entityManager.clear(); // Clear L1 cache

        // Delete the root
        componentRepository.deleteById(savedRoot.getId());
        entityManager.flush();

        // Verify everything in the tree is deleted
        assertThat(componentRepository.findById(savedRoot.getId())).isEmpty();
        assertThat(componentRepository.findById(savedLevel1.getId())).isEmpty();
        assertThat(componentRepository.findById(savedLevel2.getId())).isEmpty();
        assertThat(componentRepository.findById(savedLeaf.getId())).isEmpty();
    }

    @Test
    void shouldDeleteComponentWithoutChildren() {
        // Case 3: Deleting a component without children still works.
        Component loneComponent = TestFixtures.createTestComponent(null, testPage, null, ComponentType.TEXT, 0);
        Component savedComponent = componentRepository.save(loneComponent);
        
        componentRepository.flush();
        
        componentRepository.deleteById(savedComponent.getId());
        componentRepository.flush();
        
        assertThat(componentRepository.findById(savedComponent.getId())).isEmpty();
    }
}
