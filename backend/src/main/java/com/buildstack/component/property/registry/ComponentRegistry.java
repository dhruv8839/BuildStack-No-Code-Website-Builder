package com.buildstack.component.property.registry;

import com.buildstack.component.enums.ComponentType;
import com.buildstack.component.property.schema.PropertySchema;
import com.buildstack.component.property.schema.PropertyType;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
public class ComponentRegistry {

    private Map<ComponentType, ComponentDefinition> definitions = new HashMap<>();

    @PostConstruct
    public void init() {
        Map<ComponentType, ComponentDefinition> tempDefs = new HashMap<>();
        
        tempDefs.put(ComponentType.CONTAINER, createContainer());
        tempDefs.put(ComponentType.BUTTON, createButton());
        tempDefs.put(ComponentType.TEXT, createText());
        tempDefs.put(ComponentType.IMAGE, createImage());
        
        this.definitions = java.util.Collections.unmodifiableMap(tempDefs);
    }

    private ComponentDefinition createContainer() {
        return ComponentDefinition.builder()
                .type(ComponentType.CONTAINER)
                .canHaveChildren(true)
                .allowedParents(EnumSet.of(ComponentType.CONTAINER)) // Or empty for root
                .allowedChildren(EnumSet.of(ComponentType.CONTAINER, ComponentType.BUTTON, ComponentType.TEXT, ComponentType.IMAGE))
                .properties(Map.of(
                        "layout", PropertySchema.of(PropertyType.STRING, false, "flex"),
                        "direction", PropertySchema.of(PropertyType.STRING, false, "column"),
                        "gap", PropertySchema.of(PropertyType.STRING, false, "0px"),
                        "padding", PropertySchema.of(PropertyType.STRING, false, "16px"),
                        "backgroundColor", PropertySchema.of(PropertyType.COLOR, false, "transparent")
                ))
                .defaultProperties(Map.of(
                        "layout", "flex",
                        "direction", "column",
                        "gap", "0px",
                        "padding", "16px",
                        "backgroundColor", "transparent"
                ))
                .build();
    }

    private ComponentDefinition createButton() {
        return ComponentDefinition.builder()
                .type(ComponentType.BUTTON)
                .canHaveChildren(false)
                .allowedParents(EnumSet.of(ComponentType.CONTAINER))
                .allowedChildren(EnumSet.noneOf(ComponentType.class))
                .properties(Map.of(
                        "text", PropertySchema.of(PropertyType.STRING, true, "Click Me"),
                        "url", PropertySchema.of(PropertyType.URL, false, ""),
                        "variant", PropertySchema.of(PropertyType.STRING, false, "primary"),
                        "size", PropertySchema.of(PropertyType.STRING, false, "md")
                ))
                .defaultProperties(Map.of(
                        "text", "Click Me",
                        "variant", "primary",
                        "size", "md"
                ))
                .build();
    }

    private ComponentDefinition createText() {
        return ComponentDefinition.builder()
                .type(ComponentType.TEXT)
                .canHaveChildren(false)
                .allowedParents(EnumSet.of(ComponentType.CONTAINER))
                .allowedChildren(EnumSet.noneOf(ComponentType.class))
                .properties(Map.of(
                        "content", PropertySchema.of(PropertyType.STRING, true, "Text block"),
                        "fontSize", PropertySchema.of(PropertyType.STRING, false, "16px"),
                        "fontWeight", PropertySchema.of(PropertyType.STRING, false, "normal"),
                        "color", PropertySchema.of(PropertyType.COLOR, false, "#000000"),
                        "textAlign", PropertySchema.of(PropertyType.STRING, false, "left")
                ))
                .defaultProperties(Map.of(
                        "content", "Text block",
                        "fontSize", "16px",
                        "fontWeight", "normal",
                        "color", "#000000",
                        "textAlign", "left"
                ))
                .build();
    }

    private ComponentDefinition createImage() {
        return ComponentDefinition.builder()
                .type(ComponentType.IMAGE)
                .canHaveChildren(false)
                .allowedParents(EnumSet.of(ComponentType.CONTAINER))
                .allowedChildren(EnumSet.noneOf(ComponentType.class))
                .properties(Map.of(
                        "src", PropertySchema.of(PropertyType.URL, true, ""),
                        "alt", PropertySchema.of(PropertyType.STRING, false, ""),
                        "width", PropertySchema.of(PropertyType.STRING, false, "100%"),
                        "height", PropertySchema.of(PropertyType.STRING, false, "auto"),
                        "objectFit", PropertySchema.of(PropertyType.STRING, false, "cover")
                ))
                .defaultProperties(Map.of(
                        "src", "",
                        "alt", "",
                        "width", "100%",
                        "height", "auto",
                        "objectFit", "cover"
                ))
                .build();
    }

    public ComponentDefinition getDefinition(ComponentType type) {
        return definitions.get(type);
    }
    
    public Set<ComponentType> getSupportedTypes() {
        return definitions.keySet();
    }
}
