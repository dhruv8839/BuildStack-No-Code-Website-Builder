package com.buildstack.component.service;

import com.buildstack.component.dto.ComponentCreateRequest;
import com.buildstack.component.dto.ComponentResponse;
import com.buildstack.component.dto.ComponentUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface ComponentService {
    ComponentResponse createComponent(UUID pageId, ComponentCreateRequest request);
    ComponentResponse getComponentById(UUID componentId);
    List<ComponentResponse> getAllComponentsForPage(UUID pageId);
    ComponentResponse updateComponent(UUID componentId, ComponentUpdateRequest request);
    void deleteComponent(UUID componentId);
    
    com.buildstack.component.dto.ComponentPropertyResponse mergeProperties(UUID componentId, com.buildstack.component.dto.ComponentPropertyUpdateRequest request);
    
    com.buildstack.component.dto.ComponentPropertyResponse replaceProperties(UUID componentId, com.buildstack.component.dto.ComponentPropertyUpdateRequest request);
}
