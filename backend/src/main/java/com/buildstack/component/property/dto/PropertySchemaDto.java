package com.buildstack.component.property.dto;

import com.buildstack.component.property.schema.PropertyType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PropertySchemaDto {
    private PropertyType type;
    private boolean required;
    private Object defaultValue;
}
