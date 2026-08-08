package com.buildstack.generation.service;

import com.buildstack.component.entity.Component;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Service
public class ComponentRendererService {

    public String render(Component rootComponent) {
        if (rootComponent == null) {
            return "";
        }

        StringBuilder html = new StringBuilder();
        renderComponent(rootComponent, html);
        return html.toString();
    }

    private void renderComponent(Component component, StringBuilder html) {
        String tag = mapTypeToTag(component);
        String className = "c-" + component.getId().toString().replace("-", "");
        
        html.append("<").append(tag).append(" class=\"").append(className).append("\"");

        // Inject content or attributes if necessary (like src for images)
        Map<String, Object> props = component.getProps();
        if (props != null) {
            if ("img".equals(tag) && props.containsKey("src")) {
                html.append(" src=\"").append(props.get("src")).append("\"");
            }
            if ("img".equals(tag) && props.containsKey("alt")) {
                html.append(" alt=\"").append(props.get("alt")).append("\"");
            }
            if ("a".equals(tag) && props.containsKey("href")) {
                html.append(" href=\"").append(props.get("href")).append("\"");
            }
        }

        html.append(">");

        // Content
        if (props != null && props.containsKey("text") && ("p".equals(tag) || "span".equals(tag) || "h1".equals(tag) || "button".equals(tag) || "a".equals(tag))) {
            html.append(props.get("text"));
        }

        // Children
        Set<Component> children = component.getChildren();
        if (children != null && !children.isEmpty()) {
            for (Component child : children) {
                renderComponent(child, html);
            }
        }

        // Close tag (self-closing for img)
        if (!"img".equals(tag) && !"br".equals(tag) && !"hr".equals(tag)) {
            html.append("</").append(tag).append(">");
        }
    }

    private String mapTypeToTag(Component component) {
        return switch (component.getType()) {
            case CONTAINER -> "div";
            case TEXT -> "p"; // Or span, depending on props, but let's default to p
            case IMAGE -> "img";
            case BUTTON -> "button";
        };
    }
}
