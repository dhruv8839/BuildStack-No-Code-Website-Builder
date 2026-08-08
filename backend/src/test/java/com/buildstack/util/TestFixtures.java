package com.buildstack.util;

import com.buildstack.auth.entity.Role;
import com.buildstack.auth.enums.RoleName;
import com.buildstack.auth.entity.User;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationInvitation;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.InvitationStatus;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.project.entity.Project;
import com.buildstack.project.enums.ProjectStatus;
import com.buildstack.project.entity.Page;
import com.buildstack.project.enums.PageStatus;
import com.buildstack.component.entity.Component;
import com.buildstack.component.enums.ComponentType;
import com.buildstack.asset.entity.Asset;
import com.buildstack.asset.enums.AssetStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Set;
import java.util.UUID;

public class TestFixtures {

    public static User createTestUser(Long id, String email) {
        return User.builder()
                .id(id)
                .email(email)
                .password("password")
                .firstName("Test")
                .lastName("User")
                .roles(Set.of())
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static Organization createTestOrganization(UUID id, String slug, User creator) {
        return Organization.builder()
                .id(id)
                .name(slug + " Name")
                .slug(slug)
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .version(0L)
                .build();
    }

    public static Workspace createTestWorkspace(UUID id, String key, Organization org) {
        return Workspace.builder()
                .id(id)
                .organization(org)
                .name(key + " Workspace")
                .key(key)
                .archived(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .version(0L)
                .build();
    }

    public static OrganizationMember createTestMember(UUID id, Organization org, User user, OrganizationRole role) {
        return OrganizationMember.builder()
                .id(id)
                .organization(org)
                .user(user)
                .role(role)
                .joinedAt(LocalDateTime.now())
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .version(0L)
                .build();
    }

    public static OrganizationInvitation createTestInvitation(UUID id, Organization org, String email, String token, User inviter) {
        return OrganizationInvitation.builder()
                .id(id)
                .organization(org)
                .email(email)
                .role(OrganizationRole.MEMBER)
                .token(token)
                .status(InvitationStatus.PENDING)
                .invitedBy(inviter)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .version(0L)
                .build();
    }

    public static Project createTestProject(UUID id, Workspace workspace, String name, String slug) {
        return Project.builder()
                .id(id)
                .workspace(workspace)
                .name(name)
                .slug(slug)
                .status(ProjectStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .version(0L)
                .build();
    }

    public static Page createTestPage(UUID id, Project project, String name, String slug) {
        return Page.builder()
                .id(id)
                .project(project)
                .name(name)
                .slug(slug)
                .title(name + " Title")
                .description(name + " Description")
                .isHomePage(false)
                .status(PageStatus.DRAFT)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .version(0L)
                .build();
    }

    public static Component createTestComponent(UUID id, Page page, Component parent, ComponentType type, int orderIndex) {
        return Component.builder()
                .id(id)
                .page(page)
                .parent(parent)
                .type(type)
                .props(new HashMap<>())
                .orderIndex(orderIndex)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .version(0L)
                .build();
    }

    public static Asset createTestAsset(UUID id, Workspace workspace) {
        String uniqueKey = (id != null ? id : UUID.randomUUID()) + "/test-asset.png";
        return Asset.builder()
                .id(id)
                .workspace(workspace)
                .filename("test-asset.png")
                .storageKey(uniqueKey)
                .url("http://localhost:8080/uploads/" + uniqueKey)
                .contentType("image/png")
                .sizeBytes(2048L)
                .status(AssetStatus.ACTIVE)
                .build();
    }
}
