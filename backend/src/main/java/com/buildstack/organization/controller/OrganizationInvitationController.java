package com.buildstack.organization.controller;

import com.buildstack.organization.dto.AcceptInvitationRequest;
import com.buildstack.organization.dto.DeclineInvitationRequest;
import com.buildstack.organization.dto.InvitationRequest;
import com.buildstack.organization.dto.InvitationResponse;
import com.buildstack.organization.service.OrganizationInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OrganizationInvitationController {

    private final OrganizationInvitationService organizationInvitationService;

    @PostMapping("/organizations/{organizationId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse invite(
            @PathVariable UUID organizationId,
            @Valid @RequestBody InvitationRequest request) {
        return organizationInvitationService.invite(organizationId, request);
    }

    @GetMapping("/organizations/{organizationId}/invitations")
    @ResponseStatus(HttpStatus.OK)
    public List<InvitationResponse> getPendingInvitations(@PathVariable UUID organizationId) {
        return organizationInvitationService.getPendingInvitations(organizationId);
    }

    @PatchMapping("/organizations/{organizationId}/invitations/{invitationId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelInvitation(
            @PathVariable UUID organizationId,
            @PathVariable UUID invitationId) {
        organizationInvitationService.cancel(organizationId, invitationId);
    }

    @PostMapping("/invitations/accept")
    @ResponseStatus(HttpStatus.OK)
    public void acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        organizationInvitationService.accept(request.token());
    }

    @PostMapping("/invitations/decline")
    @ResponseStatus(HttpStatus.OK)
    public void declineInvitation(@Valid @RequestBody DeclineInvitationRequest request) {
        organizationInvitationService.decline(request.token());
    }
}
