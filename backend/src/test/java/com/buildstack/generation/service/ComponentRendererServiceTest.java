package com.buildstack.generation.service;

import com.buildstack.component.entity.Component;
import com.buildstack.component.enums.ComponentType;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ComponentRendererServiceTest {

    private final ComponentRendererService rendererService = new ComponentRendererService();

    @Test
    void render_Success() {
        Component root = new Component();
        root.setId(UUID.randomUUID());
        root.setType(ComponentType.CONTAINER);
        
        Component child = new Component();
        child.setId(UUID.randomUUID());
        child.setType(ComponentType.TEXT);
        Map<String, Object> childProps = new HashMap<>();
        childProps.put("text", "Hello World");
        child.setProps(childProps);
        
        root.setChildren(Set.of(child));

        String html = rendererService.render(root);

        assertTrue(html.contains("<div"));
        assertTrue(html.contains("<p"));
        assertTrue(html.contains("Hello World"));
        assertTrue(html.contains("</p>"));
        assertTrue(html.contains("</div>"));
    }
}
