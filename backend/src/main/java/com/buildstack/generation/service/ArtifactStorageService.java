package com.buildstack.generation.service;

import java.util.UUID;

public interface ArtifactStorageService {

    /**
     * Stores the generated artifact (e.g. site.zip) and returns the storage key.
     * @param versionId The WebsiteVersion ID for scoping
     * @param data The byte array of the zip file
     * @return The storage key
     */
    String storeArtifact(UUID versionId, byte[] data);

    /**
     * Retrieves the artifact as a byte array.
     */
    byte[] getArtifact(String storageKey);
    
    /**
     * Deletes the artifact.
     */
    void deleteArtifact(String storageKey);
}
