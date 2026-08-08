package com.buildstack.project.service.impl;

import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.project.dto.PageCreateRequest;
import com.buildstack.project.dto.PageResponse;
import com.buildstack.project.dto.PageUpdateRequest;
import com.buildstack.project.entity.Page;
import com.buildstack.project.mapper.PageMapper;
import com.buildstack.project.repository.PageRepository;
import com.buildstack.project.service.PageService;
import com.buildstack.project.entity.Project;
import com.buildstack.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageServiceImpl implements PageService {

    private final PageRepository pageRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final PageMapper pageMapper;
    private final CurrentUserService currentUserService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Override
    @Transactional
    public PageResponse createPage(UUID projectId, PageCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        verifyAdminAccess(project.getWorkspace().getOrganization().getId());

        String slug = request.slug().trim().toLowerCase();
        if (pageRepository.existsByProjectIdAndSlug(projectId, slug)) {
            throw new BadRequestException("Page with slug '" + slug + "' already exists in this project");
        }

        if (request.isHomePage()) {
            unsetExistingHomePage(projectId);
        }

        Page page = pageMapper.toEntity(request);
        page.setProject(project);
        page.setSlug(slug);

        Page savedPage = pageRepository.save(page);
        return pageMapper.toResponse(savedPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse getPageById(UUID pageId) {
        Page page = findPageOrThrow(pageId);
        verifyMemberAccess(page.getProject().getWorkspace().getOrganization().getId());
        return pageMapper.toResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageResponse> getAllPagesForProject(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
                
        verifyMemberAccess(project.getWorkspace().getOrganization().getId());

        return pageRepository.findAllByProjectId(projectId).stream()
                .map(pageMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PageResponse updatePage(UUID pageId, PageUpdateRequest request) {
        Page page = findPageOrThrow(pageId);
        verifyAdminAccess(page.getProject().getWorkspace().getOrganization().getId());

        String newSlug = request.slug().trim().toLowerCase();
        if (!page.getSlug().equals(newSlug) &&
                pageRepository.existsByProjectIdAndSlug(page.getProject().getId(), newSlug)) {
            throw new BadRequestException("Page with slug '" + newSlug + "' already exists in this project");
        }

        if (request.isHomePage() && !page.isHomePage()) {
            unsetExistingHomePage(page.getProject().getId());
        }

        pageMapper.updateEntityFromRequest(request, page);
        page.setSlug(newSlug);

        Page updatedPage = pageRepository.save(page);
        return pageMapper.toResponse(updatedPage);
    }

    @Override
    @Transactional
    public void deletePage(UUID pageId) {
        Page page = findPageOrThrow(pageId);
        verifyAdminAccess(page.getProject().getWorkspace().getOrganization().getId());
        pageRepository.delete(page);
    }

    @Override
    @Transactional(readOnly = true)
    public com.buildstack.project.dto.BuilderStateDto getBuilderState(UUID pageId) {
        Page page = findPageOrThrow(pageId);
        verifyMemberAccess(page.getProject().getWorkspace().getOrganization().getId());
        if (page.getBuilderData() == null) {
            return null;
        }
        com.buildstack.project.dto.BuilderStateDto dto = objectMapper.convertValue(page.getBuilderData(), com.buildstack.project.dto.BuilderStateDto.class);
        dto.setVersion(page.getVersion());
        return dto;
    }

    @Override
    @Transactional
    public com.buildstack.project.dto.BuilderStateDto saveBuilderState(UUID pageId, com.buildstack.project.dto.BuilderStateDto state) {
        Page page = findPageOrThrow(pageId);
        verifyAdminAccess(page.getProject().getWorkspace().getOrganization().getId());

        if (state.getNodes() != null && state.getNodes().size() > 1000) {
            throw new BadRequestException("Maximum of 1000 nodes are allowed per page");
        }

        page.setBuilderData(objectMapper.convertValue(state, com.fasterxml.jackson.databind.JsonNode.class));
        Page savedPage = pageRepository.saveAndFlush(page);
        
        com.buildstack.project.dto.BuilderStateDto response = objectMapper.convertValue(savedPage.getBuilderData(), com.buildstack.project.dto.BuilderStateDto.class);
        response.setVersion(savedPage.getVersion());
        return response;
    }

    private void unsetExistingHomePage(UUID projectId) {
        pageRepository.findByProjectIdAndIsHomePageTrue(projectId).ifPresent(homePage -> {
            homePage.setHomePage(false);
            pageRepository.save(homePage);
        });
    }

    private Page findPageOrThrow(UUID id) {
        return pageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found with id: " + id));
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("User is not authorized to manage pages in this organization.");
        }
    }
    
    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization");
        }
    }
}
