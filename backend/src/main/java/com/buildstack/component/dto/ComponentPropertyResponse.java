package com.buildstack.component.dto;

import java.util.Map;
import java.util.UUID;

public record ComponentPropertyResponse(
        UUID componentId,
        Map<String, Object> props
) {}
