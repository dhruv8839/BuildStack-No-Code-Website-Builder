package com.buildstack.publishing.controller;

import com.buildstack.publishing.dto.PublishJobResponse;
import com.buildstack.publishing.dto.PublishRequest;
import com.buildstack.publishing.service.PublishJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/publish-jobs")
@RequiredArgsConstructor
public class PublishJobController {

    private final PublishJobService publishJobService;

    @PostMapping
    public ResponseEntity<PublishJobResponse> requestPublish(@Valid @RequestBody PublishRequest request) {
        return new ResponseEntity<>(publishJobService.requestPublish(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublishJobResponse> getPublishJob(@PathVariable UUID id) {
        return ResponseEntity.ok(publishJobService.getPublishJob(id));
    }

    @GetMapping
    public ResponseEntity<List<PublishJobResponse>> getPublishJobsForVersion(@RequestParam UUID websiteVersionId) {
        return ResponseEntity.ok(publishJobService.getPublishJobsForVersion(websiteVersionId));
    }
}
