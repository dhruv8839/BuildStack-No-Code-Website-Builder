package com.buildstack.publishing.service;

import com.buildstack.publishing.dto.PublishHistoryResponse;

import java.util.List;
import java.util.UUID;

public interface PublishHistoryService {
    PublishHistoryResponse getPublishHistory(UUID historyId);
    List<PublishHistoryResponse> getPublishHistoriesForVersion(UUID versionId);
}
