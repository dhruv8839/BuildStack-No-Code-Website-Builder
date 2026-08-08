package com.buildstack.domain.mapper;

import com.buildstack.domain.dto.DomainResponse;
import com.buildstack.domain.entity.Domain;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DomainMapper {

    @Mapping(source = "project.id", target = "projectId")
    DomainResponse toResponse(Domain domain);
}
