package com.buildstack.asset.service;

import com.buildstack.asset.dto.AssetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface AssetService {

    /**
     * Uploads a file and persists asset metadata.
     *
     * @param workspaceId the target workspace
     * @param file        the multipart file to upload
     * @return the persisted AssetResponse
     */
    AssetResponse uploadAsset(UUID workspaceId, MultipartFile file);

    /**
     * Returns a paginated list of assets for the given workspace.
     *
     * @param workspaceId the target workspace
     * @param pageable    pagination parameters
     * @return page of AssetResponse
     */
    Page<AssetResponse> getAssetsForWorkspace(UUID workspaceId, Pageable pageable);

    /**
     * Returns a single asset by ID, verifying workspace membership.
     *
     * @param workspaceId the workspace that owns the asset
     * @param assetId     the asset UUID
     * @return AssetResponse
     */
    AssetResponse getAssetById(UUID workspaceId, UUID assetId);

    /**
     * Deletes the asset record and physical file.
     *
     * @param workspaceId the workspace that owns the asset
     * @param assetId     the asset UUID
     */
    void deleteAsset(UUID workspaceId, UUID assetId);
    
    /**
     * Deletes all assets for a workspace (used during workspace deletion).
     *
     * @param workspaceId the workspace UUID
     */
    void deleteAllAssetsForWorkspace(UUID workspaceId);
}
