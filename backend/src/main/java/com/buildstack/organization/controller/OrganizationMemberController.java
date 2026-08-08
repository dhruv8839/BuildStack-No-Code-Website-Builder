package com.buildstack.organization.controller;

import com.buildstack.organization.dto.OrganizationMemberRequest;
import com.buildstack.organization.dto.OrganizationMemberResponse;
import com.buildstack.organization.service.OrganizationMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/members")
@RequiredArgsConstructor
public class OrganizationMemberController {

    private final OrganizationMemberService organizationMemberService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<OrganizationMemberResponse> getMembers(@PathVariable UUID organizationId) {
        return organizationMemberService.getMembers(organizationId);
    }

    @PutMapping("/{memberId}/role")
    @ResponseStatus(HttpStatus.OK)
    public OrganizationMemberResponse updateMemberRole(
            @PathVariable UUID organizationId,
            @PathVariable UUID memberId,
            @Valid @RequestBody OrganizationMemberRequest request) {
        return organizationMemberService.updateMemberRole(organizationId, memberId, request);
    }

    @DeleteMapping("/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(
            @PathVariable UUID organizationId,
            @PathVariable UUID memberId) {
        organizationMemberService.removeMember(organizationId, memberId);
    }

    @DeleteMapping("/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveOrganization(@PathVariable UUID organizationId) {
        organizationMemberService.leaveOrganization(organizationId);
    }
}
