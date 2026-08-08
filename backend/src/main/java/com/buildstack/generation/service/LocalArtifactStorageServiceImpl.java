package com.buildstack.generation.service;

import com.buildstack.asset.exception.StorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalArtifactStorageServiceImpl implements ArtifactStorageService {

    private final Path rootArtifactDir;

    public LocalArtifactStorageServiceImpl(@Value("${storage.local.artifact-dir:artifacts}") String artifactDir) {
        this.rootArtifactDir = Paths.get(artifactDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootArtifactDir);
        } catch (IOException ex) {
            throw new StorageException("Could not initialize artifact storage directory: " + artifactDir, ex);
        }
    }

    @Override
    public String storeArtifact(UUID versionId, byte[] data) {
        String storageKey = versionId.toString() + "/site.zip";
        Path targetDir = rootArtifactDir.resolve(versionId.toString());
        Path targetFile = rootArtifactDir.resolve(storageKey).normalize();

        if (!targetFile.startsWith(rootArtifactDir)) {
            throw new StorageException("Cannot store artifact outside the root directory: " + storageKey);
        }

        try {
            Files.createDirectories(targetDir);
            Files.write(targetFile, data);
        } catch (IOException ex) {
            throw new StorageException("Failed to store artifact: " + storageKey, ex);
        }

        return storageKey;
    }

    @Override
    public byte[] getArtifact(String storageKey) {
        Path targetFile = rootArtifactDir.resolve(storageKey).normalize();

        if (!targetFile.startsWith(rootArtifactDir)) {
            throw new StorageException("Cannot read artifact outside the root directory: " + storageKey);
        }

        try {
            return Files.readAllBytes(targetFile);
        } catch (IOException ex) {
            throw new StorageException("Failed to read artifact: " + storageKey, ex);
        }
    }

    @Override
    public void deleteArtifact(String storageKey) {
        Path targetFile = rootArtifactDir.resolve(storageKey).normalize();

        if (!targetFile.startsWith(rootArtifactDir)) {
            throw new StorageException("Cannot delete artifact outside the root directory: " + storageKey);
        }

        try {
            Files.deleteIfExists(targetFile);
        } catch (IOException ex) {
            throw new StorageException("Failed to delete artifact: " + storageKey, ex);
        }
    }
}
