package com.buildstack.component.property.schema;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PropertySchema {
    private final PropertyType type;
    private final boolean required;
    private final Object defaultValue;

    public static PropertySchema of(PropertyType type, boolean required, Object defaultValue) {
        return PropertySchema.builder()
                .type(type)
                .required(required)
                .defaultValue(defaultValue)
                .build();
    }
}
