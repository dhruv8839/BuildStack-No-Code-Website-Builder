package com.buildstack.publishing.controller;

import com.buildstack.publishing.dto.PublishHistoryResponse;
import com.buildstack.publishing.service.PublishHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/publish-histories")
@RequiredArgsConstructor
public class PublishHistoryController {

    private final PublishHistoryService publishHistoryService;

    @GetMapping("/{id}")
    public ResponseEntity<PublishHistoryResponse> getPublishHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(publishHistoryService.getPublishHistory(id));
    }

    @GetMapping
    public ResponseEntity<List<PublishHistoryResponse>> getPublishHistoriesForVersion(@RequestParam UUID websiteVersionId) {
        return ResponseEntity.ok(publishHistoryService.getPublishHistoriesForVersion(websiteVersionId));
    }
}
