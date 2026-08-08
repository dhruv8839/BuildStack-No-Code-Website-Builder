package com.buildstack.component.property.registry;

import com.buildstack.component.enums.ComponentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ComponentRegistryTest {

    private ComponentRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new ComponentRegistry();
        registry.init();
    }

    @Test
    void shouldRegisterDefaultComponents() {
        assertThat(registry.getSupportedTypes())
                .containsExactlyInAnyOrder(ComponentType.CONTAINER, ComponentType.BUTTON, ComponentType.TEXT, ComponentType.IMAGE);
    }

    @Test
    void shouldReturnCorrectDefinitionForContainer() {
        ComponentDefinition def = registry.getDefinition(ComponentType.CONTAINER);
        
        assertThat(def).isNotNull();
        assertThat(def.getType()).isEqualTo(ComponentType.CONTAINER);
        assertThat(def.isCanHaveChildren()).isTrue();
        assertThat(def.getAllowedParents()).contains(ComponentType.CONTAINER);
        assertThat(def.getProperties()).containsKey("layout");
        assertThat(def.getDefaultProperties()).containsEntry("layout", "flex");
    }

    @Test
    void shouldReturnCorrectDefinitionForButton() {
        ComponentDefinition def = registry.getDefinition(ComponentType.BUTTON);
        
        assertThat(def).isNotNull();
        assertThat(def.getType()).isEqualTo(ComponentType.BUTTON);
        assertThat(def.isCanHaveChildren()).isFalse();
        assertThat(def.getAllowedChildren()).isEmpty();
        assertThat(def.getProperties()).containsKey("text");
        assertThat(def.getDefaultProperties()).containsEntry("text", "Click Me");
    }
}
