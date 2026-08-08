package com.buildstack.component.property.util;

import java.util.HashMap;
import java.util.Map;

public class ResponsiveResolutionUtil {

    public static final String RESPONSIVE_KEY = "responsive";
    public static final String BREAKPOINT_DESKTOP = "desktop"; // Usually just the base props, but can be explicit
    public static final String BREAKPOINT_TABLET = "tablet";
    public static final String BREAKPOINT_MOBILE = "mobile";

    /**
     * Resolves the effective properties for a given breakpoint.
     * Order of inheritance: Base (Desktop) -> Tablet -> Mobile
     *
     * @param baseProps The base component properties (which may include a "responsive" key)
     * @param targetBreakpoint The breakpoint to resolve for (e.g., "mobile", "tablet", "desktop")
     * @return The flattened effective properties for that breakpoint
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> resolve(Map<String, Object> baseProps, String targetBreakpoint) {
        if (baseProps == null) {
            return new HashMap<>();
        }

        // 1. Start with base properties, excluding the 'responsive' key
        Map<String, Object> effectiveProps = new HashMap<>(baseProps);
        effectiveProps.remove(RESPONSIVE_KEY);

        Map<String, Object> responsiveNode = (Map<String, Object>) baseProps.get(RESPONSIVE_KEY);
        if (responsiveNode == null || BREAKPOINT_DESKTOP.equalsIgnoreCase(targetBreakpoint)) {
            // Desktop is just the base props (or explicitly defined desktop overrides, if we supported them)
            // For simplicity, desktop is base.
            if (responsiveNode != null && responsiveNode.containsKey(BREAKPOINT_DESKTOP)) {
                 effectiveProps = JsonMergeUtil.merge(effectiveProps, (Map<String, Object>) responsiveNode.get(BREAKPOINT_DESKTOP));
            }
            return effectiveProps;
        }

        // 2. Apply Tablet overrides if target is Tablet or Mobile
        if (BREAKPOINT_TABLET.equalsIgnoreCase(targetBreakpoint) || BREAKPOINT_MOBILE.equalsIgnoreCase(targetBreakpoint)) {
            if (responsiveNode.containsKey(BREAKPOINT_TABLET)) {
                Map<String, Object> tabletOverrides = (Map<String, Object>) responsiveNode.get(BREAKPOINT_TABLET);
                effectiveProps = JsonMergeUtil.merge(effectiveProps, tabletOverrides);
            }
        }

        // 3. Apply Mobile overrides if target is Mobile
        if (BREAKPOINT_MOBILE.equalsIgnoreCase(targetBreakpoint)) {
            if (responsiveNode.containsKey(BREAKPOINT_MOBILE)) {
                Map<String, Object> mobileOverrides = (Map<String, Object>) responsiveNode.get(BREAKPOINT_MOBILE);
                effectiveProps = JsonMergeUtil.merge(effectiveProps, mobileOverrides);
            }
        }

        return effectiveProps;
    }
}
