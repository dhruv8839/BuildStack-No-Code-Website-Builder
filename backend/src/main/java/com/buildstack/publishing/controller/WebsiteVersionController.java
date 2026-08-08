package com.buildstack.publishing.controller;

import com.buildstack.publishing.dto.WebsiteVersionCreateRequest;
import com.buildstack.publishing.dto.WebsiteVersionResponse;
import com.buildstack.publishing.enums.WebsiteVersionStatus;
import com.buildstack.publishing.service.WebsiteVersionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/website-versions")
@RequiredArgsConstructor
public class WebsiteVersionController {

    private final WebsiteVersionService websiteVersionService;

    @PostMapping
    public ResponseEntity<WebsiteVersionResponse> createVersion(@Valid @RequestBody WebsiteVersionCreateRequest request) {
        return new ResponseEntity<>(websiteVersionService.createVersion(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebsiteVersionResponse> getVersion(@PathVariable UUID id) {
        return ResponseEntity.ok(websiteVersionService.getVersion(id));
    }

    @GetMapping
    public ResponseEntity<List<WebsiteVersionResponse>> getVersionsByProject(@RequestParam UUID projectId) {
        return ResponseEntity.ok(websiteVersionService.getVersionsByProject(projectId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WebsiteVersionResponse> updateVersionStatus(
            @PathVariable UUID id,
            @RequestParam WebsiteVersionStatus status) {
        return ResponseEntity.ok(websiteVersionService.updateVersionStatus(id, status));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Void> archiveVersion(@PathVariable UUID id) {
        websiteVersionService.archiveVersion(id);
        return ResponseEntity.noContent().build();
    }
}
