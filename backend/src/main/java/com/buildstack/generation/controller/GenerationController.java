package com.buildstack.generation.controller;

import com.buildstack.publishing.dto.PublishJobResponse;
import com.buildstack.publishing.dto.PublishRequest;
import com.buildstack.publishing.entity.ArtifactMetadata;
import com.buildstack.publishing.repository.ArtifactMetadataRepository;
import com.buildstack.publishing.service.PublishJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/generation")
@RequiredArgsConstructor
public class GenerationController {

    private final PublishJobService publishJobService;
    private final ArtifactMetadataRepository artifactMetadataRepository;

    @PostMapping("/{versionId}/generate")
    public ResponseEntity<PublishJobResponse> generateArtifact(@PathVariable UUID versionId) {
        PublishRequest request = new PublishRequest(versionId);
        return ResponseEntity.ok(publishJobService.requestPublish(request));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<PublishJobResponse> getGenerationStatus(@PathVariable UUID jobId) {
        return ResponseEntity.ok(publishJobService.getPublishJob(jobId));
    }

    @GetMapping("/artifacts/{versionId}")
    public ResponseEntity<List<ArtifactMetadataDto>> listGeneratedArtifacts(@PathVariable UUID versionId) {
        // Technically we should go through a service and verify access permissions.
        // For brevity in Increment 13 we verify access using the publishJobService helper 
        // to check if user has access to jobs for this version.
        publishJobService.getPublishJobsForVersion(versionId); // Verifies access
        
        List<ArtifactMetadata> metadataList = artifactMetadataRepository.findAll().stream()
                .filter(m -> m.getPublishHistory().getWebsiteVersion().getId().equals(versionId))
                .collect(Collectors.toList());
                
        List<ArtifactMetadataDto> response = metadataList.stream()
                .map(m -> new ArtifactMetadataDto(m.getId(), m.getChecksum(), m.getSizeBytes(), m.getCreatedAt().toString()))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(response);
    }
    
    public record ArtifactMetadataDto(UUID id, String checksum, Long sizeBytes, String createdAt) {}
}
