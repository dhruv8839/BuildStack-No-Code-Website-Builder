package com.buildstack.project.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class BuilderNodeDto {
    private String id;
    private String type;
    private String parentId;
    private List<String> children;
    private Map<String, Object> content;
    private ResponsiveStyleDto style;
    private Map<String, Object> settings;
}
