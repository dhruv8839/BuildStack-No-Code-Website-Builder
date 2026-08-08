package com.buildstack.component.service;

import com.buildstack.component.dto.BatchPropertyUpdateRequest;
import com.buildstack.component.dto.ComponentMoveRequest;
import com.buildstack.component.dto.ComponentReorderRequest;
import com.buildstack.component.dto.ComponentResponse;

import java.util.List;
import java.util.UUID;

public interface BuilderOperationService {
    
    ComponentResponse duplicateComponent(UUID componentId);
    
    ComponentResponse moveComponent(UUID componentId, ComponentMoveRequest request);
    
    ComponentResponse reorderComponent(UUID componentId, ComponentReorderRequest request);
    
    List<ComponentResponse> batchUpdateProperties(BatchPropertyUpdateRequest request);
}
