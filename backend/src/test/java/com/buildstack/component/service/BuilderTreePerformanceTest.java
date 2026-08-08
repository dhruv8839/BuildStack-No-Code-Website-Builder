package com.buildstack.component.service;

import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentMoveRequest;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.util.StopWatch;

import java.util.HashMap;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.springframework.test.context.ActiveProfiles;

import com.buildstack.config.TestBase;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.mockito.Mockito;

@SpringBootTest
@ActiveProfiles("test")
class BuilderTreePerformanceTest extends TestBase {

    @Autowired
    private ComponentService componentService;

    @Autowired
    private BuilderOperationService builderOperationService;

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

    private Page testPage;

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
        user.setEmail("perf@example.com");
        user.setPassword("password");
        user.setFirstName("Perf");
        user.setLastName("User");
        user = userRepository.save(user);

        Organization org = new Organization();
        org.setName("Perf Org");
        org.setSlug("perf-org");
        org.setCreatedBy(user);
        org = organizationRepository.save(org);

        OrganizationMember member = new OrganizationMember();
        member.setOrganization(org);
        member.setUser(user);
        member.setRole(OrganizationRole.OWNER);
        member.setJoinedAt(java.time.LocalDateTime.now());
        memberRepository.save(member);

        Workspace workspace = new Workspace();
        workspace.setName("Perf Workspace");
        workspace.setOrganization(org);
        workspace.setKey("PRF");
        workspace = workspaceRepository.save(workspace);

        Project project = new Project();
        project.setName("Perf Project");
        project.setSlug("perf-project");
        project.setWorkspace(workspace);
        project = projectRepository.save(project);

        Mockito.when(currentUserService.getCurrentUserId()).thenReturn(user.getId());
        Mockito.when(currentUserService.getCurrentUser()).thenReturn(user);

        Page page = new Page();
        page.setName("Perf Page");
        page.setSlug("perf-page");
        page.setProject(project);
        testPage = pageRepository.save(page);
    }

    @Test
    void testLargeTreePerformance() {
        StopWatch stopWatch = new StopWatch();
        
        stopWatch.start("Create Tree");
        // Create a root container
        ComponentCreateRequest rootReq = new ComponentCreateRequest(null, ComponentType.CONTAINER, new HashMap<>(), 0);
        UUID rootId = componentService.createComponent(testPage.getId(), rootReq).id();

        // Create 20 children
        for (int i = 0; i < 20; i++) {
            ComponentCreateRequest childReq = new ComponentCreateRequest(rootId, ComponentType.CONTAINER, new HashMap<>(), i);
            UUID childId = componentService.createComponent(testPage.getId(), childReq).id();
            
            // Create 5 grandchildren for each
            for (int j = 0; j < 5; j++) {
                ComponentCreateRequest grandChildReq = new ComponentCreateRequest(childId, ComponentType.TEXT, new HashMap<>(), j);
                componentService.createComponent(testPage.getId(), grandChildReq);
            }
        }
        stopWatch.stop();

        // Total components: 1 (root) + 20 (children) + (20*5) (grandchildren) = 121
        
        stopWatch.start("Duplicate Root");
        UUID duplicatedId = builderOperationService.duplicateComponent(rootId).id();
        stopWatch.stop();

        // Total components: 121 + 121 = 242

        stopWatch.start("Move Root");
        // Create another root to move into
        ComponentCreateRequest targetRootReq = new ComponentCreateRequest(null, ComponentType.CONTAINER, new HashMap<>(), 1);
        UUID targetRootId = componentService.createComponent(testPage.getId(), targetRootReq).id();
        
        builderOperationService.moveComponent(duplicatedId, new ComponentMoveRequest(targetRootId, 0));
        stopWatch.stop();
        
        System.out.println(stopWatch.prettyPrint());
        
        // Assert operations happened well within limits (e.g. less than 5 seconds each)
        assertTrue(stopWatch.getTotalTimeSeconds() < 10.0, "Performance test took too long");
    }
}
