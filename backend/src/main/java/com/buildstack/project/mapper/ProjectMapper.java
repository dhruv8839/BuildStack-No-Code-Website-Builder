package com.buildstack.project.mapper;

import com.buildstack.project.dto.ProjectCreateRequest;
import com.buildstack.project.dto.ProjectResponse;
import com.buildstack.project.dto.ProjectUpdateRequest;
import com.buildstack.project.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "customDomain", ignore = true)
    Project toEntity(ProjectCreateRequest request);

    @Mapping(source = "workspace.id", target = "workspaceId")
    ProjectResponse toResponse(Project project);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workspace", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromRequest(ProjectUpdateRequest request, @MappingTarget Project project);
}
