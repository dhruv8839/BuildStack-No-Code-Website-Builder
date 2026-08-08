package com.buildstack.component.controller;

import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.dto.ComponentUpdateRequest;
import com.buildstack.component.service.ComponentService;
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
public class ComponentController {

    private final ComponentService componentService;

    @PostMapping("/pages/{pageId}/components")
    public ResponseEntity<ComponentResponse> createComponent(
            @PathVariable UUID pageId,
            @Valid @RequestBody ComponentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(componentService.createComponent(pageId, request));
    }

    @GetMapping("/pages/{pageId}/components")
    public ResponseEntity<List<ComponentResponse>> getComponentsForPage(@PathVariable UUID pageId) {
        return ResponseEntity.ok(componentService.getAllComponentsForPage(pageId));
    }

    @GetMapping("/components/{componentId}")
    public ResponseEntity<ComponentResponse> getComponent(@PathVariable UUID componentId) {
        return ResponseEntity.ok(componentService.getComponentById(componentId));
    }

    @PutMapping("/components/{componentId}")
    public ResponseEntity<ComponentResponse> updateComponent(
            @PathVariable UUID componentId,
            @Valid @RequestBody ComponentUpdateRequest request) {
        return ResponseEntity.ok(componentService.updateComponent(componentId, request));
    }

    @DeleteMapping("/components/{componentId}")
    public ResponseEntity<Void> deleteComponent(@PathVariable UUID componentId) {
        componentService.deleteComponent(componentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/components/{componentId}/properties")
    public ResponseEntity<com.buildstack.component.dto.ComponentPropertyResponse> updateComponentProperties(
            @PathVariable UUID componentId,
            @Valid @RequestBody com.buildstack.component.dto.ComponentPropertyUpdateRequest request) {
        return ResponseEntity.ok(componentService.mergeProperties(componentId, request));
    }
}
