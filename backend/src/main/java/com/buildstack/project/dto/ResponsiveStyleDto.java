package com.buildstack.project.dto;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResponsiveStyleDto {

    @Builder.Default
    private Map<String, Object> desktop = new HashMap<>();

    @Builder.Default
    private Map<String, Object> tablet = new HashMap<>();

    @Builder.Default
    private Map<String, Object> mobile = new HashMap<>();
}
