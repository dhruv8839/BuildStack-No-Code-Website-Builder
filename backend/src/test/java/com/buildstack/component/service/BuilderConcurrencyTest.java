package com.buildstack.component.service;

import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentPropertyUpdateRequest;
import com.buildstack.component.entity.Component;
import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.repository.ComponentRepository;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.project.entity.Page;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.PageRepository;
import com.buildstack.project.repository.ProjectRepository;
import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.springframework.test.context.ActiveProfiles;

import com.buildstack.config.TestBase;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.mockito.Mockito;

@SpringBootTest
@ActiveProfiles("test")
class BuilderConcurrencyTest extends TestBase {

    @Autowired
    private ComponentService componentService;

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
    private OrganizationMemberRepository memberRepository;
    
    @Autowired
    private PlatformTransactionManager transactionManager;

    private Page testPage;
    private Component rootComponent;

    @MockBean
    private com.buildstack.common.security.CurrentUserService currentUserService;

    @BeforeEach
    void setUp() {
        componentRepository.deleteAll();
        pageRepository.deleteAll();
        projectRepository.deleteAll();
        workspaceRepository.deleteAll();
        memberRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User();
        user.setEmail("admin@example.com");
        user.setPassword("password");
        user.setFirstName("Admin");
        user.setLastName("User");
        user = userRepository.save(user);

        Organization org = new Organization();
        org.setName("Test Org");
        org.setSlug("test-org");
        org.setCreatedBy(user);
        org = organizationRepository.save(org);

        OrganizationMember member = new OrganizationMember();
        member.setOrganization(org);
        member.setUser(user);
        member.setRole(OrganizationRole.OWNER);
        member.setJoinedAt(java.time.LocalDateTime.now());
        memberRepository.save(member);

        Workspace workspace = new Workspace();
        workspace.setName("Test Workspace");
        workspace.setOrganization(org);
        workspace.setKey("TST");
        workspace = workspaceRepository.save(workspace);

        Project project = new Project();
        project.setName("Test Project");
        project.setSlug("test-project");
        project.setWorkspace(workspace);
        project = projectRepository.save(project);

        Mockito.when(currentUserService.getCurrentUserId()).thenReturn(user.getId());
        Mockito.when(currentUserService.getCurrentUser()).thenReturn(user);

        Page page = new Page();
        page.setName("Test Page");
        page.setSlug("test-page");
        page.setProject(project);
        testPage = pageRepository.save(page);
    }

    @Test
    void testOptimisticLockingConflict() {
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        
        // 1. Create a component
        ComponentCreateRequest req = new ComponentCreateRequest(null, ComponentType.CONTAINER, new HashMap<>(), 0);
        UUID compId = componentService.createComponent(testPage.getId(), req).id();
        
        // 2. Fetch it in two different transactions
        Component tx1Component = transactionTemplate.execute(status -> componentRepository.findById(compId).orElseThrow());
        Component tx2Component = transactionTemplate.execute(status -> componentRepository.findById(compId).orElseThrow());
        
        // 3. Update it in TX1 and commit
        transactionTemplate.execute(status -> {
            Component c = componentRepository.findById(compId).orElseThrow();
            c.setOrderIndex(5);
            componentRepository.save(c);
            return null;
        });
        
        // 4. Try to save the outdated tx2Component (which still has version 0)
        assertThrows(ObjectOptimisticLockingFailureException.class, () -> {
            transactionTemplate.execute(status -> {
                tx2Component.setOrderIndex(10);
                componentRepository.save(tx2Component); // This should throw ObjectOptimisticLockingFailureException
                return null;
            });
        });
    }
}
