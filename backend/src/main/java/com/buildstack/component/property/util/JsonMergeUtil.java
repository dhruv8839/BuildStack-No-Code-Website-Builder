package com.buildstack.component.property.util;

import java.util.HashMap;
import java.util.Map;

public class JsonMergeUtil {

    /**
     * Deeply merges a patch map into a target map.
     * New keys are added, existing keys are overwritten.
     * If both target and patch have a Map at the same key, they are merged recursively.
     *
     * @param target the original map (not mutated)
     * @param patch  the updates to apply
     * @return a new map containing the merged result
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> merge(Map<String, Object> target, Map<String, Object> patch) {
        if (target == null) {
            target = new HashMap<>();
        }
        if (patch == null || patch.isEmpty()) {
            return new HashMap<>(target);
        }

        Map<String, Object> result = new HashMap<>(target);

        for (Map.Entry<String, Object> entry : patch.entrySet()) {
            String key = entry.getKey();
            Object patchValue = entry.getValue();

            if (patchValue instanceof Map<?, ?> && result.get(key) instanceof Map<?, ?>) {
                // Recursive merge for nested objects
                Map<String, Object> mergedNested = merge(
                        (Map<String, Object>) result.get(key),
                        (Map<String, Object>) patchValue
                );
                result.put(key, mergedNested);
            } else {
                // Overwrite or add new value
                result.put(key, patchValue);
            }
        }

        return result;
    }
}
