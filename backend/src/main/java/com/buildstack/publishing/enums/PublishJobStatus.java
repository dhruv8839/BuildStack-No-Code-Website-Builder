package com.buildstack.publishing.enums;

public enum PublishJobStatus {
    QUEUED,
    BUILDING,
    VALIDATING,
    PACKAGING,
    DEPLOYING,
    SUCCESS,
    FAILED
}
