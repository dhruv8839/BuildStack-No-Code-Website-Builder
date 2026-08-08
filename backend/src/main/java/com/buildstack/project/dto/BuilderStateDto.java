package com.buildstack.project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuilderStateDto {
    
    private Long version;
    
    @NotNull
    private Integer schemaVersion;
    
    @NotNull
    private String rootNodeId;
    
    @NotNull
    @Size(max = 1000, message = "Maximum of 1000 nodes are allowed per page")
    private Map<String, BuilderNodeDto> nodes;
}
