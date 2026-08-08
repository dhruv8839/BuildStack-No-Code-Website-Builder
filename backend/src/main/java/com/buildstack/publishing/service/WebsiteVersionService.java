package com.buildstack.publishing.service;

import com.buildstack.publishing.dto.WebsiteVersionCreateRequest;
import com.buildstack.publishing.dto.WebsiteVersionResponse;

import java.util.List;
import java.util.UUID;

public interface WebsiteVersionService {
    WebsiteVersionResponse createVersion(WebsiteVersionCreateRequest request);
    WebsiteVersionResponse getVersion(UUID versionId);
    List<WebsiteVersionResponse> getVersionsByProject(UUID projectId);
    WebsiteVersionResponse updateVersionStatus(UUID versionId, com.buildstack.publishing.enums.WebsiteVersionStatus newStatus);
    void archiveVersion(UUID versionId);
}
