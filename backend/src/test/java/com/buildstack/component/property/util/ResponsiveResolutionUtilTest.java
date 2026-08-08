package com.buildstack.component.property.util;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ResponsiveResolutionUtilTest {

    @Test
    void shouldResolveDesktopProperties() {
        Map<String, Object> baseProps = new HashMap<>();
        baseProps.put("fontSize", "18px");
        baseProps.put("color", "#000000");

        Map<String, Object> tabletOverrides = new HashMap<>();
        tabletOverrides.put("fontSize", "16px");

        Map<String, Object> responsive = new HashMap<>();
        responsive.put("tablet", tabletOverrides);
        baseProps.put("responsive", responsive);

        Map<String, Object> resolved = ResponsiveResolutionUtil.resolve(baseProps, "desktop");

        assertThat(resolved).hasSize(2);
        assertThat(resolved.get("fontSize")).isEqualTo("18px");
        assertThat(resolved.get("color")).isEqualTo("#000000");
        assertThat(resolved).doesNotContainKey("responsive");
    }

    @Test
    void shouldResolveTabletProperties() {
        Map<String, Object> baseProps = new HashMap<>();
        baseProps.put("fontSize", "18px");
        baseProps.put("color", "#000000");

        Map<String, Object> tabletOverrides = new HashMap<>();
        tabletOverrides.put("fontSize", "16px");

        Map<String, Object> mobileOverrides = new HashMap<>();
        mobileOverrides.put("fontSize", "14px");

        Map<String, Object> responsive = new HashMap<>();
        responsive.put("tablet", tabletOverrides);
        responsive.put("mobile", mobileOverrides);
        baseProps.put("responsive", responsive);

        Map<String, Object> resolved = ResponsiveResolutionUtil.resolve(baseProps, "tablet");

        assertThat(resolved).hasSize(2);
        assertThat(resolved.get("fontSize")).isEqualTo("16px"); // Overridden
        assertThat(resolved.get("color")).isEqualTo("#000000"); // Inherited
        assertThat(resolved).doesNotContainKey("responsive");
    }

    @Test
    void shouldResolveMobilePropertiesWithTabletInheritance() {
        Map<String, Object> baseProps = new HashMap<>();
        baseProps.put("fontSize", "18px");
        baseProps.put("color", "#000000");
        baseProps.put("padding", "20px");

        Map<String, Object> tabletOverrides = new HashMap<>();
        tabletOverrides.put("padding", "10px");

        Map<String, Object> mobileOverrides = new HashMap<>();
        mobileOverrides.put("fontSize", "14px");

        Map<String, Object> responsive = new HashMap<>();
        responsive.put("tablet", tabletOverrides);
        responsive.put("mobile", mobileOverrides);
        baseProps.put("responsive", responsive);

        Map<String, Object> resolved = ResponsiveResolutionUtil.resolve(baseProps, "mobile");

        assertThat(resolved).hasSize(3);
        assertThat(resolved.get("fontSize")).isEqualTo("14px"); // Overridden by mobile
        assertThat(resolved.get("padding")).isEqualTo("10px"); // Inherited from tablet
        assertThat(resolved.get("color")).isEqualTo("#000000"); // Inherited from desktop
        assertThat(resolved).doesNotContainKey("responsive");
    }

    @Test
    void shouldHandleMissingBreakpoints() {
        Map<String, Object> baseProps = new HashMap<>();
        baseProps.put("fontSize", "18px");

        Map<String, Object> resolved = ResponsiveResolutionUtil.resolve(baseProps, "tablet");

        assertThat(resolved).hasSize(1);
        assertThat(resolved.get("fontSize")).isEqualTo("18px");
    }
}
