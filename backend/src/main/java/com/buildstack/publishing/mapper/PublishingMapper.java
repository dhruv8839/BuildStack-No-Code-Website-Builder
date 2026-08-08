package com.buildstack.publishing.mapper;

import com.buildstack.publishing.dto.ArtifactMetadataResponse;
import com.buildstack.publishing.dto.PublishHistoryResponse;
import com.buildstack.publishing.dto.PublishJobResponse;
import com.buildstack.publishing.dto.WebsiteVersionResponse;
import com.buildstack.publishing.entity.ArtifactMetadata;
import com.buildstack.publishing.entity.PublishHistory;
import com.buildstack.publishing.entity.PublishJob;
import com.buildstack.publishing.entity.WebsiteVersion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PublishingMapper {

    @Mapping(source = "project.id", target = "projectId")
    @Mapping(source = "createdBy.id", target = "createdById")
    WebsiteVersionResponse toResponse(WebsiteVersion entity);

    @Mapping(source = "websiteVersion.id", target = "websiteVersionId")
    @Mapping(source = "triggeredBy.id", target = "triggeredById")
    PublishJobResponse toResponse(PublishJob entity);

    @Mapping(source = "websiteVersion.id", target = "websiteVersionId")
    @Mapping(source = "author.id", target = "authorId")
    PublishHistoryResponse toResponse(PublishHistory entity);

    ArtifactMetadataResponse toResponse(ArtifactMetadata entity);
}
