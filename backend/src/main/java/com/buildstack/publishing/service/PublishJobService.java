package com.buildstack.publishing.service;

import com.buildstack.publishing.dto.PublishJobResponse;
import com.buildstack.publishing.dto.PublishRequest;

import java.util.List;
import java.util.UUID;

public interface PublishJobService {
    PublishJobResponse requestPublish(PublishRequest request);
    PublishJobResponse getPublishJob(UUID jobId);
    List<PublishJobResponse> getPublishJobsForVersion(UUID versionId);
}
