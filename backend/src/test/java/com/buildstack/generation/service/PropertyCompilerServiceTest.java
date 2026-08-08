package com.buildstack.generation.service;

import com.buildstack.component.entity.Component;
import com.buildstack.component.enums.ComponentType;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PropertyCompilerServiceTest {

    private final PropertyCompilerService compilerService = new PropertyCompilerService();

    @Test
    void compileCss_Success() {
        Component c1 = new Component();
        c1.setId(UUID.randomUUID());
        c1.setType(ComponentType.CONTAINER);
        
        Map<String, Object> props = new HashMap<>();
        props.put("backgroundColor", "#ffffff");
        props.put("padding", "20px");
        c1.setProps(props);

        String css = compilerService.compileCss(Set.of(c1));

        assertTrue(css.contains(".c-" + c1.getId().toString().replace("-", "")));
        assertTrue(css.contains("background-color: #ffffff;"));
        assertTrue(css.contains("padding: 20px;"));
    }
}
