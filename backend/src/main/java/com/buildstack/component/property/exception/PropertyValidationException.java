package com.buildstack.component.property.exception;

import com.buildstack.exception.BadRequestException;

public class PropertyValidationException extends BadRequestException {
    
    public PropertyValidationException(String message) {
        super(message);
    }
}
