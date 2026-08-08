package com.buildstack.deployment.mapper;

import com.buildstack.deployment.dto.DeploymentResponse;
import com.buildstack.deployment.entity.Deployment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DeploymentMapper {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "websiteVersion.id", target = "websiteVersionId")
    @Mapping(source = "websiteVersion.versionNumber", target = "versionNumber")
    @Mapping(source = "deployedBy.email", target = "deployedByEmail")
    DeploymentResponse toResponse(Deployment deployment);
}
