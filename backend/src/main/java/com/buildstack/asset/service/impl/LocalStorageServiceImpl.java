package com.buildstack.asset.service.impl;

import com.buildstack.asset.exception.StorageException;
import com.buildstack.asset.service.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

/**
 * Local filesystem implementation of StorageService.
 *
 * Files are stored at: ${storage.local.upload-dir}/{workspaceId}/{assetId}.{extension}
 * Files are served at:  ${storage.local.base-url}/uploads/{workspaceId}/{assetId}.{extension}
 *
 * This implementation is suitable for local development only.
 * For production, replace with S3StorageServiceImpl or similar.
 */
@Service
public class LocalStorageServiceImpl implements StorageService {

    private final Path rootUploadDir;
    private final String baseUrl;

    public LocalStorageServiceImpl(
            @Value("${storage.local.upload-dir:uploads}") String uploadDir,
            @Value("${storage.local.base-url:http://localhost:8080}") String baseUrl) {
        this.rootUploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
        try {
            Files.createDirectories(this.rootUploadDir);
        } catch (IOException ex) {
            throw new StorageException("Could not initialize storage directory: " + uploadDir, ex);
        }
    }

    @Override
    public String store(UUID workspaceId, UUID assetId, MultipartFile file) {
        String extension = getExtension(Objects.requireNonNull(file.getOriginalFilename()));
        String storageKey = workspaceId + "/" + assetId + "." + extension;

        Path targetDir = rootUploadDir.resolve(workspaceId.toString());
        Path targetFile = rootUploadDir.resolve(storageKey).normalize();

        // Security guard: ensure the resolved path is still inside the upload root
        if (!targetFile.startsWith(rootUploadDir)) {
            throw new StorageException("Cannot store file outside the upload directory: " + storageKey);
        }

        try {
            Files.createDirectories(targetDir);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new StorageException("Failed to store file: " + storageKey, ex);
        }

        return storageKey;
    }

    @Override
    public String resolveUrl(String storageKey) {
        return baseUrl + "/uploads/" + storageKey;
    }

    @Override
    public java.io.InputStream getStream(String storageKey) {
        Path targetFile = rootUploadDir.resolve(storageKey).normalize();
        if (!targetFile.startsWith(rootUploadDir)) {
            throw new StorageException("Cannot read file outside the upload directory: " + storageKey);
        }
        try {
            return Files.newInputStream(targetFile);
        } catch (IOException ex) {
            throw new StorageException("Failed to read file: " + storageKey, ex);
        }
    }

    @Override
    public void delete(String storageKey) {
        Path targetFile = rootUploadDir.resolve(storageKey).normalize();

        // Security guard: ensure the resolved path is inside upload root
        if (!targetFile.startsWith(rootUploadDir)) {
            throw new StorageException("Cannot delete file outside the upload directory: " + storageKey);
        }

        try {
            Files.deleteIfExists(targetFile);
        } catch (IOException ex) {
            throw new StorageException("Failed to delete file: " + storageKey, ex);
        }
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "bin";
        }
        return filename.substring(dotIndex + 1).toLowerCase();
    }
}
