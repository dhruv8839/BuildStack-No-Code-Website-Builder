package com.buildstack.component.property.validation;

import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.property.exception.PropertyValidationException;
import com.buildstack.component.property.registry.ComponentDefinition;
import com.buildstack.component.property.registry.ComponentRegistry;
import com.buildstack.component.property.schema.PropertySchema;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class PropertyValidator {

    public static final String RESPONSIVE_KEY = "responsive";
    
    private final ComponentRegistry componentRegistry;

    public void validate(ComponentType type, Map<String, Object> props) {
        if (props == null) {
            props = Map.of();
        }

        ComponentDefinition definition = componentRegistry.getDefinition(type);
        if (definition == null) {
            throw new PropertyValidationException("No component definition found for type: " + type);
        }

        Map<String, PropertySchema> schemas = definition.getProperties();

        // Validate base properties
        validateProperties(type, props, schemas, false);
        
        // Validate responsive overrides
        if (props.containsKey(RESPONSIVE_KEY)) {
            Object responsiveObj = props.get(RESPONSIVE_KEY);
            if (!(responsiveObj instanceof Map)) {
                throw new PropertyValidationException("'responsive' must be an object");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> responsiveMap = (Map<String, Object>) responsiveObj;
            
            for (Map.Entry<String, Object> entry : responsiveMap.entrySet()) {
                String breakpoint = entry.getKey();
                if (!Set.of("desktop", "tablet", "mobile").contains(breakpoint)) {
                    throw new PropertyValidationException("Unknown responsive breakpoint: " + breakpoint);
                }
                
                Object breakpointProps = entry.getValue();
                if (!(breakpointProps instanceof Map)) {
                    throw new PropertyValidationException(String.format("Responsive breakpoint '%s' must be an object", breakpoint));
                }
                
                @SuppressWarnings("unchecked")
                Map<String, Object> overrideProps = (Map<String, Object>) breakpointProps;
                
                // Validate overrides (isOverride = true to skip required field checks)
                validateProperties(type, overrideProps, schemas, true);
            }
        }
    }

    private void validateProperties(ComponentType type, Map<String, Object> props, Map<String, PropertySchema> schemas, boolean isOverride) {
        // 1. Check for unknown properties
        for (String key : props.keySet()) {
            if (key.equals(RESPONSIVE_KEY) && !isOverride) {
                continue; // Special keyword at top level
            }
            if (!schemas.containsKey(key)) {
                throw new PropertyValidationException(
                        String.format("Unknown property '%s' for component type '%s'", key, type)
                );
            }
        }

        // 2. Validate against schema
        for (Map.Entry<String, PropertySchema> entry : schemas.entrySet()) {
            String key = entry.getKey();
            PropertySchema schema = entry.getValue();
            Object value = props.get(key);

            if (value == null) {
                if (!isOverride && schema.isRequired()) {
                    throw new PropertyValidationException(
                            String.format("Missing required property '%s' for component type '%s'", key, type)
                    );
                }
            } else {
                validateType(key, value, schema);
            }
        }
    }

    private void validateType(String key, Object value, PropertySchema schema) {
        boolean valid = true;
        switch (schema.getType()) {
            case STRING:
            case COLOR:
            case URL:
                valid = value instanceof String;
                break;
            case NUMBER:
                valid = value instanceof Number;
                break;
            case BOOLEAN:
                valid = value instanceof Boolean;
                break;
            case JSON:
            case OBJECT:
                valid = value instanceof Map;
                break;
            case ARRAY:
                valid = value instanceof java.util.List;
                break;
        }

        if (!valid) {
            throw new PropertyValidationException(
                    String.format("Invalid type for property '%s'. Expected %s but got %s",
                            key, schema.getType(), value.getClass().getSimpleName())
            );
        }
    }
}
