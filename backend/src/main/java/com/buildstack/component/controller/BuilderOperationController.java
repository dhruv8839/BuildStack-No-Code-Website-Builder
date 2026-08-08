package com.buildstack.component.controller;

import com.buildstack.component.dto.BatchPropertyUpdateRequest;
import com.buildstack.component.dto.ComponentMoveRequest;
import com.buildstack.component.dto.ComponentReorderRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.service.BuilderOperationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/components")
@RequiredArgsConstructor
public class BuilderOperationController {

    private final BuilderOperationService builderOperationService;

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ComponentResponse> duplicateComponent(@PathVariable UUID id) {
        return ResponseEntity.ok(builderOperationService.duplicateComponent(id));
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<ComponentResponse> moveComponent(
            @PathVariable UUID id,
            @Valid @RequestBody ComponentMoveRequest request) {
        return ResponseEntity.ok(builderOperationService.moveComponent(id, request));
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<ComponentResponse> reorderComponent(
            @PathVariable UUID id,
            @Valid @RequestBody ComponentReorderRequest request) {
        return ResponseEntity.ok(builderOperationService.reorderComponent(id, request));
    }

    @PatchMapping("/batch/properties")
    public ResponseEntity<List<ComponentResponse>> batchUpdateProperties(
            @Valid @RequestBody BatchPropertyUpdateRequest request) {
        return ResponseEntity.ok(builderOperationService.batchUpdateProperties(request));
    }
}
