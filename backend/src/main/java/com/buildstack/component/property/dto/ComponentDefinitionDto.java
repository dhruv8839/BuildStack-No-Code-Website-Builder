package com.buildstack.component.property.dto;

import com.buildstack.component.enums.ComponentType;
import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.Set;

@Data
@Builder
public class ComponentDefinitionDto {
    private ComponentType type;
    private boolean canHaveChildren;
    private Set<ComponentType> allowedParents;
    private Set<ComponentType> allowedChildren;
    private Map<String, PropertySchemaDto> properties;
    private Map<String, Object> defaultProperties;
}
