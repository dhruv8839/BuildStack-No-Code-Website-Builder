package com.buildstack.project.service;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.dto.PageCreateRequest;
import com.buildstack.project.dto.PageResponse;
import com.buildstack.project.entity.Page;
import com.buildstack.project.mapper.PageMapper;
import com.buildstack.project.repository.PageRepository;
import com.buildstack.project.service.impl.PageServiceImpl;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PageServiceTest {

    @Mock
    private PageRepository pageRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private OrganizationMemberRepository memberRepository;

    @Mock
    private PageMapper pageMapper;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private PageServiceImpl pageService;

    private UUID projectId;
    private UUID orgId;
    private Long userId;
    private Project project;
    private OrganizationMember member;

    @BeforeEach
    void setUp() {
        projectId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        userId = 1L;

        Organization org = new Organization();
        org.setId(orgId);

        Workspace ws = new Workspace();
        ws.setOrganization(org);

        project = new Project();
        project.setId(projectId);
        project.setWorkspace(ws);

        member = new OrganizationMember();
        member.setRole(OrganizationRole.ADMIN);
    }

    @Test
    void createPage_shouldCreateSuccessfully() {
        PageCreateRequest request = new PageCreateRequest("Home", "home", "Home Title", "Desc", true);

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(memberRepository.findByOrganizationIdAndUserId(orgId, userId)).thenReturn(Optional.of(member));
        when(pageRepository.existsByProjectIdAndSlug(projectId, "home")).thenReturn(false);

        Page oldHomePage = new Page();
        when(pageRepository.findByProjectIdAndIsHomePageTrue(projectId)).thenReturn(Optional.of(oldHomePage));

        Page newPage = new Page();
        when(pageMapper.toEntity(request)).thenReturn(newPage);

        Page savedPage = new Page();
        savedPage.setId(UUID.randomUUID());
        when(pageRepository.save(any(Page.class))).thenAnswer(i -> i.getArgument(0));

        PageResponse response = new PageResponse(UUID.randomUUID(), "Home", "home", "Home Title", "Desc", true, null, projectId, null, null);
        when(pageMapper.toResponse(any(Page.class))).thenReturn(response);

        PageResponse result = pageService.createPage(projectId, request);

        assertThat(result).isNotNull();
        verify(pageRepository, times(2)).save(any(Page.class)); // 1 for unsetting old home page, 1 for new page
    }
}
