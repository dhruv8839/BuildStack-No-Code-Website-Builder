package com.buildstack.generation.service;

import com.buildstack.component.entity.Component;
import com.buildstack.component.property.util.ResponsiveResolutionUtil;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Service
public class PropertyCompilerService {

    public String compileCss(Set<Component> components) {
        StringBuilder desktopCss = new StringBuilder();
        StringBuilder tabletCss = new StringBuilder();
        StringBuilder mobileCss = new StringBuilder();

        for (Component component : components) {
            compileComponentCss(component, desktopCss, tabletCss, mobileCss);
        }

        StringBuilder finalCss = new StringBuilder();
        finalCss.append("/* Base Styles (Desktop First) */\n");
        finalCss.append(desktopCss);

        if (!tabletCss.isEmpty()) {
            finalCss.append("\n/* Tablet Styles */\n");
            finalCss.append("@media (max-width: 1024px) {\n");
            finalCss.append(tabletCss);
            finalCss.append("}\n");
        }

        if (!mobileCss.isEmpty()) {
            finalCss.append("\n/* Mobile Styles */\n");
            finalCss.append("@media (max-width: 768px) {\n");
            finalCss.append(mobileCss);
            finalCss.append("}\n");
        }

        return finalCss.toString();
    }

    private void compileComponentCss(Component component, StringBuilder desktopCss, StringBuilder tabletCss, StringBuilder mobileCss) {
        Map<String, Object> props = component.getProps();
        if (props == null || props.isEmpty()) {
            return; // No properties to compile
        }

        String className = ".c-" + component.getId().toString().replace("-", "");

        // Desktop (Base)
        Map<String, Object> desktopProps = ResponsiveResolutionUtil.resolve(props, ResponsiveResolutionUtil.BREAKPOINT_DESKTOP);
        appendCssRule(desktopCss, className, desktopProps);

        // Tablet
        Map<String, Object> tabletProps = ResponsiveResolutionUtil.resolve(props, ResponsiveResolutionUtil.BREAKPOINT_TABLET);
        Map<String, Object> tabletDiff = getDiff(desktopProps, tabletProps);
        if (!tabletDiff.isEmpty()) {
            appendCssRule(tabletCss, className, tabletDiff);
        }

        // Mobile
        Map<String, Object> mobileProps = ResponsiveResolutionUtil.resolve(props, ResponsiveResolutionUtil.BREAKPOINT_MOBILE);
        Map<String, Object> mobileDiff = getDiff(tabletProps, mobileProps); // diff against tablet, or desktop? usually cascading
        if (!mobileDiff.isEmpty()) {
            appendCssRule(mobileCss, className, mobileDiff);
        }
    }

    private Map<String, Object> getDiff(Map<String, Object> base, Map<String, Object> target) {
        Map<String, Object> diff = new java.util.HashMap<>();
        for (Map.Entry<String, Object> entry : target.entrySet()) {
            if (entry.getKey().equals(ResponsiveResolutionUtil.RESPONSIVE_KEY)) continue;
            
            Object baseVal = base.get(entry.getKey());
            if (baseVal == null || !baseVal.equals(entry.getValue())) {
                diff.put(entry.getKey(), entry.getValue());
            }
        }
        return diff;
    }

    private void appendCssRule(StringBuilder sb, String className, Map<String, Object> props) {
        if (props == null || props.isEmpty()) return;

        sb.append(className).append(" {\n");
        for (Map.Entry<String, Object> entry : props.entrySet()) {
            if (entry.getKey().equals(ResponsiveResolutionUtil.RESPONSIVE_KEY)) continue;

            String cssProperty = toKebabCase(entry.getKey());
            String cssValue = String.valueOf(entry.getValue());

            // Handle special cases like ignoring certain non-css properties
            if (isStyleProperty(entry.getKey())) {
                sb.append("  ").append(cssProperty).append(": ").append(cssValue).append(";\n");
            }
        }
        sb.append("}\n");
    }

    private boolean isStyleProperty(String key) {
        // Simple heuristic: properties that map to CSS.
        // In a real engine, we'd have a whitelist from the Property Schema registry.
        return !key.equals("src") && !key.equals("alt") && !key.equals("text") && !key.equals("href");
    }

    private String toKebabCase(String camelCase) {
        return camelCase.replaceAll("([a-z])([A-Z]+)", "$1-$2").toLowerCase();
    }
}
