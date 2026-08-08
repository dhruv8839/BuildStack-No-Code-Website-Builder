package com.buildstack.deployment.controller;

import com.buildstack.deployment.dto.DeploymentRequest;
import com.buildstack.deployment.dto.DeploymentResponse;
import com.buildstack.deployment.service.DeploymentOrchestratorService;
import com.buildstack.deployment.repository.DeploymentRepository;
import com.buildstack.deployment.enums.DeploymentStatus;
import com.buildstack.deployment.enums.DeploymentType;
import com.buildstack.deployment.mapper.DeploymentMapper;
import com.buildstack.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/deployments")
@RequiredArgsConstructor
public class DeploymentController {

    private final DeploymentOrchestratorService orchestratorService;
    private final DeploymentRepository deploymentRepository;
    private final DeploymentMapper deploymentMapper;

    @PostMapping("/preview")
    public ResponseEntity<DeploymentResponse> createPreview(@Valid @RequestBody DeploymentRequest request) {
        return new ResponseEntity<>(orchestratorService.requestPreviewDeployment(request), HttpStatus.CREATED);
    }

    @PostMapping("/production")
    public ResponseEntity<DeploymentResponse> createProduction(@Valid @RequestBody DeploymentRequest request) {
        return new ResponseEntity<>(orchestratorService.requestProductionDeployment(request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/rollback")
    public ResponseEntity<DeploymentResponse> rollback(@PathVariable UUID id) {
        return ResponseEntity.ok(orchestratorService.rollbackProduction(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeploymentResponse> getDeploymentStatus(@PathVariable UUID id) {
        return deploymentRepository.findById(id)
                .map(deploymentMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found"));
    }

    @GetMapping("/projects/{projectId}/active")
    public ResponseEntity<DeploymentResponse> getActiveDeployment(@PathVariable UUID projectId) {
        return deploymentRepository.findByProjectIdAndTypeAndStatus(projectId, DeploymentType.PRODUCTION, DeploymentStatus.ACTIVE)
                .map(deploymentMapper::toResponse)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("No active deployment found for this project"));
    }

    @GetMapping("/projects/{projectId}/history")
    public ResponseEntity<List<DeploymentResponse>> getDeploymentHistory(@PathVariable UUID projectId) {
        List<DeploymentResponse> history = deploymentRepository.findByProjectIdOrderByStartedAtDesc(projectId)
                .stream()
                .map(deploymentMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(history);
    }
}
