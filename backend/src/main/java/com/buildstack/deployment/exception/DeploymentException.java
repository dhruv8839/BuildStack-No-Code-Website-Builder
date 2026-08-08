package com.buildstack.deployment.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DeploymentException extends RuntimeException {
    public DeploymentException(String message) {
        super(message);
    }
}
