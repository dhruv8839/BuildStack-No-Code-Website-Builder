package com.buildstack.component.dto;

import java.util.Map;

public record ComponentPropertyUpdateRequest(
        Map<String, Object> props
) {}
