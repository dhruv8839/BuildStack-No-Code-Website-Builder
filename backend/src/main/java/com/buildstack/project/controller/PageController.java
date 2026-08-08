package com.buildstack.project.controller;

import com.buildstack.project.dto.PageCreateRequest;
import com.buildstack.project.dto.PageResponse;
import com.buildstack.project.dto.PageUpdateRequest;
import com.buildstack.project.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @PostMapping("/projects/{projectId}/pages")
    public ResponseEntity<PageResponse> createPage(
            @PathVariable UUID projectId,
            @Valid @RequestBody PageCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pageService.createPage(projectId, request));
    }

    @GetMapping("/projects/{projectId}/pages")
    public ResponseEntity<List<PageResponse>> getPagesForProject(@PathVariable UUID projectId) {
        return ResponseEntity.ok(pageService.getAllPagesForProject(projectId));
    }

    @GetMapping("/pages/{pageId}")
    public ResponseEntity<PageResponse> getPage(@PathVariable UUID pageId) {
        return ResponseEntity.ok(pageService.getPageById(pageId));
    }

    @PutMapping("/pages/{pageId}")
    public ResponseEntity<PageResponse> updatePage(
            @PathVariable UUID pageId,
            @Valid @RequestBody PageUpdateRequest request) {
        return ResponseEntity.ok(pageService.updatePage(pageId, request));
    }

    @DeleteMapping("/pages/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable UUID pageId) {
        pageService.deletePage(pageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pages/{pageId}/builder-state")
    public ResponseEntity<com.buildstack.project.dto.BuilderStateDto> getBuilderState(@PathVariable UUID pageId) {
        com.buildstack.project.dto.BuilderStateDto state = pageService.getBuilderState(pageId);
        if (state == null) {
            return ResponseEntity.noContent().build(); // 204 if no state exists yet
        }
        return ResponseEntity.ok(state);
    }

    @PutMapping("/pages/{pageId}/builder-state")
    public ResponseEntity<com.buildstack.project.dto.BuilderStateDto> saveBuilderState(
            @PathVariable UUID pageId,
            @Valid @RequestBody com.buildstack.project.dto.BuilderStateDto request) {
        try {
            return ResponseEntity.ok(pageService.saveBuilderState(pageId, request));
        } catch (Exception e) {
            try {
                java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("backend-error.txt", true));
                e.printStackTrace(pw);
                pw.close();
            } catch (Exception ex) {}
            throw e;
        }
    }
}
