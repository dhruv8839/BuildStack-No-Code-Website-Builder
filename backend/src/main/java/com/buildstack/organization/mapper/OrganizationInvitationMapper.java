package com.buildstack.organization.mapper;

import com.buildstack.organization.dto.InvitationResponse;
import com.buildstack.organization.entity.OrganizationInvitation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationInvitationMapper {

    @Mapping(source = "organization.id", target = "organizationId")
    @Mapping(source = "invitedBy.id", target = "invitedById")
    InvitationResponse toResponse(OrganizationInvitation invitation);
}
