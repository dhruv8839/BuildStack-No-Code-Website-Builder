package com.buildstack.component.property.util;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JsonMergeUtilTest {

    @Test
    void shouldMergeSimpleProperties() {
        Map<String, Object> target = new HashMap<>();
        target.put("text", "Old Text");
        target.put("color", "red");

        Map<String, Object> patch = new HashMap<>();
        patch.put("text", "New Text");
        patch.put("size", "lg");

        Map<String, Object> result = JsonMergeUtil.merge(target, patch);

        assertThat(result).hasSize(3);
        assertThat(result.get("text")).isEqualTo("New Text");
        assertThat(result.get("color")).isEqualTo("red");
        assertThat(result.get("size")).isEqualTo("lg");
        
        // Target should not be mutated
        assertThat(target.get("text")).isEqualTo("Old Text");
        assertThat(target).hasSize(2);
    }

    @Test
    void shouldMergeNestedObjectsRecursively() {
        Map<String, Object> targetNested = new HashMap<>();
        targetNested.put("top", "10px");
        targetNested.put("left", "5px");

        Map<String, Object> target = new HashMap<>();
        target.put("layout", targetNested);

        Map<String, Object> patchNested = new HashMap<>();
        patchNested.put("top", "20px");
        patchNested.put("right", "15px");

        Map<String, Object> patch = new HashMap<>();
        patch.put("layout", patchNested);

        Map<String, Object> result = JsonMergeUtil.merge(target, patch);

        @SuppressWarnings("unchecked")
        Map<String, Object> resultNested = (Map<String, Object>) result.get("layout");
        
        assertThat(resultNested).hasSize(3);
        assertThat(resultNested.get("top")).isEqualTo("20px");
        assertThat(resultNested.get("left")).isEqualTo("5px");
        assertThat(resultNested.get("right")).isEqualTo("15px");
    }

    @Test
    void shouldHandleNullTargetAndPatch() {
        Map<String, Object> result1 = JsonMergeUtil.merge(null, Map.of("key", "val"));
        assertThat(result1).containsEntry("key", "val");

        Map<String, Object> result2 = JsonMergeUtil.merge(Map.of("key", "val"), null);
        assertThat(result2).containsEntry("key", "val");

        Map<String, Object> result3 = JsonMergeUtil.merge(null, null);
        assertThat(result3).isEmpty();
    }
}
