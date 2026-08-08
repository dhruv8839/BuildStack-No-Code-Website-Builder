package com.buildstack.domain.controller;

import com.buildstack.domain.dto.DomainRequest;
import com.buildstack.domain.dto.DomainResponse;
import com.buildstack.domain.mapper.DomainMapper;
import com.buildstack.domain.service.DomainService;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/domains")
@RequiredArgsConstructor
public class DomainController {

    private final DomainService domainService;
    private final DomainMapper domainMapper;

    @PostMapping("/projects/{projectId}/subdomain")
    public ResponseEntity<DomainResponse> createSubdomain(
            @PathVariable UUID projectId,
            @Valid @RequestBody DomainRequest request) {
        return new ResponseEntity<>(domainMapper.toResponse(domainService.createSubdomain(projectId, request.hostname())), HttpStatus.CREATED);
    }

    @PostMapping("/projects/{projectId}/custom")
    public ResponseEntity<DomainResponse> createCustomDomain(
            @PathVariable UUID projectId,
            @Valid @RequestBody DomainRequest request) {
        return new ResponseEntity<>(domainMapper.toResponse(domainService.createCustomDomain(projectId, request.hostname())), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<DomainResponse> verifyDomain(@PathVariable UUID id) {
        return ResponseEntity.ok(domainMapper.toResponse(domainService.requestDnsVerification(id)));
    }

    @PostMapping("/{id}/ssl")
    public ResponseEntity<DomainResponse> issueSsl(@PathVariable UUID id) {
        return ResponseEntity.ok(domainMapper.toResponse(domainService.requestSslIssuance(id)));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<List<DomainResponse>> getProjectDomains(@PathVariable UUID projectId) {
        List<DomainResponse> domains = domainService.getDomainsForProject(projectId)
                .stream()
                .map(domainMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(domains);
    }
}
