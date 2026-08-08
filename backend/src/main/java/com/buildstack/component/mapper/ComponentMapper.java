package com.buildstack.component.mapper;

import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.dto.ComponentUpdateRequest;
import com.buildstack.component.entity.Component;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ComponentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "page", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Component toEntity(ComponentCreateRequest request);

    @Mapping(source = "page.id", target = "pageId")
    @Mapping(source = "parent.id", target = "parentId")
    ComponentResponse toResponse(Component component);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "page", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntityFromRequest(ComponentUpdateRequest request, @MappingTarget Component component);
}
