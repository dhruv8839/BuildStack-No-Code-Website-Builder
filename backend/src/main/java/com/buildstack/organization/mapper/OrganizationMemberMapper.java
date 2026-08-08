package com.buildstack.organization.mapper;

import com.buildstack.organization.dto.OrganizationMemberResponse;
import com.buildstack.organization.entity.OrganizationMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMemberMapper {

    @Mapping(source = "organization.id", target = "organizationId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(source = "invitedBy.id", target = "invitedById")
    OrganizationMemberResponse toResponse(OrganizationMember member);
}
