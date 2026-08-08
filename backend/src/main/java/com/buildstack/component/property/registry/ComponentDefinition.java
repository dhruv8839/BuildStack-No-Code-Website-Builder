package com.buildstack.component.property.registry;

import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.property.schema.PropertySchema;
import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.Map;
import java.util.Set;

@Getter
@Builder
public class ComponentDefinition {
    private final ComponentType type;
    
    @Builder.Default
    private final boolean canHaveChildren = false;
    
    @Builder.Default
    private final Set<ComponentType> allowedParents = Collections.emptySet();
    
    @Builder.Default
    private final Set<ComponentType> allowedChildren = Collections.emptySet();
    
    @Builder.Default
    private final Map<String, PropertySchema> properties = Collections.emptyMap();
    
    @Builder.Default
    private final Map<String, Object> defaultProperties = Collections.emptyMap();
}
