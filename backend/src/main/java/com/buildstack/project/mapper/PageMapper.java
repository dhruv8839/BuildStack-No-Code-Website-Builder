package com.buildstack.project.mapper;

import com.buildstack.project.dto.PageCreateRequest;
import com.buildstack.project.dto.PageResponse;
import com.buildstack.project.dto.PageUpdateRequest;
import com.buildstack.project.entity.Page;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PageMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Page toEntity(PageCreateRequest request);

    @Mapping(source = "project.id", target = "projectId")
    PageResponse toResponse(Page page);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "project", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromRequest(PageUpdateRequest request, @MappingTarget Page page);
}
