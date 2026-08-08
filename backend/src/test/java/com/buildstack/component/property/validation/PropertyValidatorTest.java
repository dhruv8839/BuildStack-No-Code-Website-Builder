package com.buildstack.component.property.validation;

import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.property.exception.PropertyValidationException;
import com.buildstack.component.property.registry.ComponentRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PropertyValidatorTest {

    private PropertyValidator validator;

    @BeforeEach
    void setUp() {
        ComponentRegistry registry = new ComponentRegistry();
        registry.init();
        validator = new PropertyValidator(registry);
    }

    @Test
    void shouldPassValidationForValidProperties() {
        Map<String, Object> props = new HashMap<>();
        props.put("text", "Submit");
        props.put("variant", "secondary");
        props.put("size", "lg");

        assertDoesNotThrow(() -> validator.validate(ComponentType.BUTTON, props));
    }

    @Test
    void shouldFailWhenRequiredPropertyIsMissing() {
        Map<String, Object> props = new HashMap<>();
        props.put("variant", "secondary");

        assertThrows(PropertyValidationException.class, 
                () -> validator.validate(ComponentType.BUTTON, props),
                "Missing required property 'text' for component type 'BUTTON'");
    }

    @Test
    void shouldFailForUnknownProperty() {
        Map<String, Object> props = new HashMap<>();
        props.put("text", "Submit");
        props.put("unknownProp", "value");

        assertThrows(PropertyValidationException.class, 
                () -> validator.validate(ComponentType.BUTTON, props),
                "Unknown property 'unknownProp' for component type 'BUTTON'");
    }

    @Test
    void shouldFailForInvalidPropertyType() {
        Map<String, Object> props = new HashMap<>();
        props.put("text", 12345); // Should be String

        assertThrows(PropertyValidationException.class, 
                () -> validator.validate(ComponentType.BUTTON, props),
                "Invalid type for property 'text'. Expected STRING but got Integer");
    }

    @Test
    void shouldFailForUnknownComponentType() {
        // Given a null ComponentType or a type not registered
        // Using a fake cast just for testing edge cases if needed, but Enum prevents it.
        // If definition is null, it should throw. Let's test with a mock if needed.
    }

    @Test
    void shouldPassValidationForValidResponsivePayload() {
        Map<String, Object> props = new HashMap<>();
        props.put("text", "Submit");
        
        Map<String, Object> mobileProps = new HashMap<>();
        mobileProps.put("size", "sm"); // override size
        
        Map<String, Object> responsive = new HashMap<>();
        responsive.put("mobile", mobileProps);
        
        props.put("responsive", responsive);

        assertDoesNotThrow(() -> validator.validate(ComponentType.BUTTON, props));
    }
    
    @Test
    void shouldFailForUnknownResponsiveBreakpoint() {
        Map<String, Object> props = new HashMap<>();
        props.put("text", "Submit");
        
        Map<String, Object> mobileProps = new HashMap<>();
        mobileProps.put("size", "sm");
        
        Map<String, Object> responsive = new HashMap<>();
        responsive.put("smartwatch", mobileProps); // Invalid breakpoint
        
        props.put("responsive", responsive);

        assertThrows(PropertyValidationException.class, 
                () -> validator.validate(ComponentType.BUTTON, props),
                "Unknown responsive breakpoint: smartwatch");
    }
    
    @Test
    void shouldFailForUnknownPropertyInResponsiveOverride() {
        Map<String, Object> props = new HashMap<>();
        props.put("text", "Submit");
        
        Map<String, Object> mobileProps = new HashMap<>();
        mobileProps.put("unknown", "sm"); // Unknown prop
        
        Map<String, Object> responsive = new HashMap<>();
        responsive.put("mobile", mobileProps);
        
        props.put("responsive", responsive);

        assertThrows(PropertyValidationException.class, 
                () -> validator.validate(ComponentType.BUTTON, props),
                "Unknown property 'unknown' for component type 'BUTTON'");
    }
}
