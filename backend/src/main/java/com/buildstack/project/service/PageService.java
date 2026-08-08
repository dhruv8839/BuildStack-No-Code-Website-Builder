package com.buildstack.project.service;

import com.buildstack.project.dto.PageCreateRequest;
import com.buildstack.project.dto.PageResponse;
import com.buildstack.project.dto.PageUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface PageService {
    PageResponse createPage(UUID projectId, PageCreateRequest request);
    PageResponse getPageById(UUID pageId);
    List<PageResponse> getAllPagesForProject(UUID projectId);
    PageResponse updatePage(UUID pageId, PageUpdateRequest request);
    void deletePage(UUID pageId);
    
    com.buildstack.project.dto.BuilderStateDto getBuilderState(UUID pageId);
    com.buildstack.project.dto.BuilderStateDto saveBuilderState(UUID pageId, com.buildstack.project.dto.BuilderStateDto state);
}
