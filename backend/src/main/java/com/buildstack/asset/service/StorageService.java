package com.buildstack.asset.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Abstraction for physical file storage.
 * Current implementation: LocalStorageServiceImpl (saves to local disk).
 * Future implementations: S3StorageServiceImpl, CloudflareR2StorageServiceImpl, etc.
 */
public interface StorageService {

    /**
     * Stores a file and returns the storage key (relative path or object key).
     *
     * @param workspaceId the owning workspace ID (used for directory scoping)
     * @param assetId     the pre-generated asset UUID (used to guarantee uniqueness)
     * @param file        the multipart file to store
     * @return the storage key that uniquely identifies this file within the storage system
     */
    String store(UUID workspaceId, UUID assetId, MultipartFile file);

    /**
     * Resolves the public URL for a given storage key.
     *
     * @param storageKey the storage key returned by {@link #store}
     * @return the publicly accessible URL
     */
    String resolveUrl(String storageKey);

    /**
     * Retrieves the stored file as an InputStream.
     *
     * @param storageKey the storage key of the file
     * @return an InputStream for the file content
     */
    java.io.InputStream getStream(String storageKey);

    /**
     * Deletes the physical file identified by the storage key.
     *
     * @param storageKey the storage key of the file to delete
     */
    void delete(String storageKey);
}
