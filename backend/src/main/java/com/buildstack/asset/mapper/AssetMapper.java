package com.buildstack.asset.mapper;

import com.buildstack.asset.dto.AssetResponse;
import com.buildstack.asset.entity.Asset;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AssetMapper {

    @Mapping(source = "workspace.id", target = "workspaceId")
    AssetResponse toResponse(Asset asset);
}
