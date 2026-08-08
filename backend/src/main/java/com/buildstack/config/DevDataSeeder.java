package com.buildstack.config;

import com.buildstack.auth.dto.request.RegisterRequest;
import com.buildstack.auth.entity.Role;
import com.buildstack.auth.entity.User;
import com.buildstack.auth.enums.RoleName;
import com.buildstack.auth.exception.RoleNotFoundException;
import com.buildstack.auth.repository.RoleRepository;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.auth.security.CustomUserDetails;
import com.buildstack.auth.service.AuthenticationService;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.dto.OrganizationRequest;
import com.buildstack.organization.dto.OrganizationResponse;
import com.buildstack.organization.dto.WorkspaceRequest;
import com.buildstack.organization.dto.WorkspaceResponse;
import com.buildstack.organization.service.OrganizationService;
import com.buildstack.organization.service.WorkspaceService;
import com.buildstack.project.dto.PageCreateRequest;
import com.buildstack.project.dto.PageResponse;
import com.buildstack.project.dto.ProjectCreateRequest;
import com.buildstack.project.dto.ProjectResponse;
import com.buildstack.project.service.PageService;
import com.buildstack.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

/**
 * Development Data Seeder.
 * 
 * This seeder runs automatically on application startup when the "dev" profile is active.
 * It is completely idempotent and ensures that a default admin user, organization, workspace,
 * project, and home page are available for immediate use during development.
 * 
 * If entities already exist, it repairs any missing relationships (such as ensuring the admin
 * has the correct role and is the owner of the organization) rather than creating duplicates.
 * 
 * CAUTION: This class utilizes SecurityContext impersonation internally to reuse existing 
 * service layer business logic and validation. The context is strictly isolated and cleared.
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    // Constants for seed data
    private static final String ADMIN_EMAIL = "admin@buildstack.com";
    private static final String ADMIN_PASSWORD = "Admin@123";
    private static final String ADMIN_FIRST_NAME = "Admin";
    private static final String ADMIN_LAST_NAME = "User";

    private static final String ORG_NAME = "BuildStack Inc";
    private static final String ORG_SLUG = "buildstack-inc";
    private static final String ORG_DESC = "Default seeded organization";

    private static final String WORKSPACE_NAME = "Default Workspace";
    private static final String WORKSPACE_KEY = "DEFAULT";
    private static final String WORKSPACE_DESC = "Default seeded workspace";

    private static final String PROJECT_NAME = "My Website";
    private static final String PROJECT_SLUG = "my-website";
    private static final String PROJECT_DESC = "Default seeded project";

    private static final String PAGE_NAME = "Home";
    private static final String PAGE_SLUG = "home";
    private static final String PAGE_TITLE = "Home Page";
    private static final String PAGE_DESC = "Default seeded home page";

    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationService organizationService;
    private final WorkspaceService workspaceService;
    private final ProjectService projectService;
    private final PageService pageService;
    private final TransactionTemplate transactionTemplate;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public void run(String... args) {
        log.info("Starting development data seeder...");

        try {
            seedAdminUser();
            seedOrganizationAndHierarchy();
            log.info("Development data seeder finished successfully.");
        } catch (Exception e) {
            log.error("Error during development data seeding", e);
        }
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Seed admin user '{}' already exists.", ADMIN_EMAIL);
            ensureAdminRole();
            return;
        }

        log.info("Creating seed admin user '{}'...", ADMIN_EMAIL);
        RegisterRequest registerRequest = RegisterRequest.builder()
                .firstName(ADMIN_FIRST_NAME)
                .lastName(ADMIN_LAST_NAME)
                .email(ADMIN_EMAIL)
                .password(ADMIN_PASSWORD)
                .confirmPassword(ADMIN_PASSWORD)
                .build();

        authenticationService.register(registerRequest);
        log.info("Created seed admin user '{}'.", ADMIN_EMAIL);

        ensureAdminRole();
    }

    private void ensureAdminRole() {
        // Since the service only adds ROLE_USER (or if the user already existed without ROLE_ADMIN), 
        // we manually add ROLE_ADMIN to the seeded admin user.
        transactionTemplate.execute(status -> {
            User user = userRepository.findByEmail(ADMIN_EMAIL)
                    .orElseThrow(() -> new RuntimeException("Seeded admin user not found"));

            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RoleNotFoundException("Role ADMIN not found. Is RoleInitializer running?"));

            if (!user.getRoles().contains(adminRole)) {
                log.info("Adding admin role to seed user '{}'...", ADMIN_EMAIL);
                user.addRole(adminRole);
                userRepository.save(user);
                log.info("Admin role added to seed user '{}'.", ADMIN_EMAIL);
            }
            return null;
        });
    }

    private void seedOrganizationAndHierarchy() {
        /*
         * Note: The existing service layer methods (OrganizationService, WorkspaceService, etc.) 
         * rely on CurrentUserService to verify ownership and authorization. Because this seeder 
         * runs outside of an HTTP request, there is no active SecurityContext.
         * We isolate this impersonation here to respect the existing architecture and business rules
         * without modifying them. The context is cleared in the finally block.
         */
        Authentication authentication = transactionTemplate.execute(status -> {
            User adminUser = userRepository.findByEmail(ADMIN_EMAIL)
                    .orElseThrow(() -> new RuntimeException("Seeded admin user not found"));
            CustomUserDetails userDetails = new CustomUserDetails(adminUser);
            return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        });

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User detachedAdminUser = userRepository.findByEmail(ADMIN_EMAIL)
                .orElseThrow(() -> new RuntimeException("Seeded admin user not found"));

        try {
            OrganizationResponse org = seedOrganization(detachedAdminUser);
            WorkspaceResponse workspace = seedWorkspace(org);
            ProjectResponse project = seedProject(workspace);
            seedPage(project);
        } finally {
            // Always clear the context after impersonation
            SecurityContextHolder.clearContext();
            log.info("SecurityContext cleared after seeder impersonation.");
        }
    }

    private OrganizationResponse seedOrganization(User adminUser) {
        try {
            OrganizationResponse existingOrg = organizationService.getOrganizationBySlug(ORG_SLUG);
            log.info("Seed organization '{}' already exists.", ORG_SLUG);
            ensureUserIsOrgOwner(existingOrg.id(), adminUser);
            return existingOrg;
        } catch (ResourceNotFoundException e) {
            log.info("Creating seed organization '{}'...", ORG_SLUG);
            OrganizationRequest request = new OrganizationRequest(ORG_NAME, ORG_SLUG, ORG_DESC, null);
            OrganizationResponse response = organizationService.createOrganization(request);
            
            ensureUserIsOrgOwner(response.id(), adminUser);
            return response;
        }
    }

    private void ensureUserIsOrgOwner(java.util.UUID orgId, User adminUser) {
        Organization orgEntity = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Org not found"));

        boolean isMember = organizationMemberRepository.findByOrganizationIdAndUserId(orgId, adminUser.getId()).isPresent();
        if (!isMember) {
            log.info("Adding admin user as OWNER of organization '{}'...", orgEntity.getSlug());
            OrganizationMember member = OrganizationMember.builder()
                    .organization(orgEntity)
                    .user(adminUser)
                    .role(OrganizationRole.OWNER)
                    .joinedAt(java.time.LocalDateTime.now())
                    .build();
            organizationMemberRepository.saveAndFlush(member);
        }
    }

    private WorkspaceResponse seedWorkspace(OrganizationResponse org) {
        List<WorkspaceResponse> workspaces = workspaceService.getOrganizationWorkspaces(org.id());
        for (WorkspaceResponse ws : workspaces) {
            if (WORKSPACE_KEY.equals(ws.key())) {
                log.info("Seed workspace '{}' already exists.", WORKSPACE_KEY);
                return ws;
            }
        }

        log.info("Creating seed workspace '{}'...", WORKSPACE_KEY);
        WorkspaceRequest request = new WorkspaceRequest(WORKSPACE_NAME, WORKSPACE_KEY, WORKSPACE_DESC, "#4F46E5", null);
        return workspaceService.createWorkspace(org.id(), request);
    }

    private ProjectResponse seedProject(WorkspaceResponse workspace) {
        List<ProjectResponse> projects = projectService.getAllProjectsForWorkspace(workspace.id());
        for (ProjectResponse proj : projects) {
            if (PROJECT_SLUG.equals(proj.slug())) {
                log.info("Seed project '{}' already exists.", PROJECT_SLUG);
                return proj;
            }
        }

        log.info("Creating seed project '{}'...", PROJECT_SLUG);
        ProjectCreateRequest request = new ProjectCreateRequest(PROJECT_NAME, PROJECT_SLUG, PROJECT_DESC, workspace.id());
        return projectService.createProject(request);
    }

    private void seedPage(ProjectResponse project) {
        List<PageResponse> pages = pageService.getAllPagesForProject(project.id());
        for (PageResponse page : pages) {
            if (PAGE_SLUG.equals(page.slug())) {
                log.info("Seed page '{}' already exists.", PAGE_SLUG);
                return;
            }
        }

        log.info("Creating seed home page '{}'...", PAGE_SLUG);
        PageCreateRequest request = new PageCreateRequest(PAGE_NAME, PAGE_SLUG, PAGE_TITLE, PAGE_DESC, true);
        pageService.createPage(project.id(), request);
    }
}
