package com.buildstack.asset.service.impl;

import com.buildstack.asset.dto.AssetResponse;
import com.buildstack.asset.entity.Asset;
import com.buildstack.asset.enums.AssetStatus;
import com.buildstack.asset.exception.StorageException;
import com.buildstack.asset.mapper.AssetMapper;
import com.buildstack.asset.repository.AssetRepository;
import com.buildstack.asset.service.AssetService;
import com.buildstack.asset.service.StorageService;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.exception.ResourceNotFoundException;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.apache.tika.Tika;

import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024L; // 5 MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml"
    );

    private final AssetRepository assetRepository;
    private final WorkspaceRepository workspaceRepository;
    private final OrganizationMemberRepository memberRepository;
    private final StorageService storageService;
    private final AssetMapper assetMapper;
    private final CurrentUserService currentUserService;
    
    private final Tika tika = new Tika();

    @Override
    @Transactional
    public AssetResponse uploadAsset(UUID workspaceId, MultipartFile file) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        verifyAdminAccess(workspace.getOrganization().getId());

        validateFile(file);

        // Generate UUID first so we can use it as the storage key — this decouples the DB ID from the filename
        UUID assetId = UUID.randomUUID();
        String storageKey = null;

        try {
            storageKey = storageService.store(workspaceId, assetId, file);
            String url = storageService.resolveUrl(storageKey);

            // Sanitize filename
            String originalFilename = file.getOriginalFilename();
            String sanitizedFilename = originalFilename != null ? Paths.get(originalFilename).getFileName().toString() : "unknown";

            Asset asset = Asset.builder()
                    .id(assetId)
                    .workspace(workspace)
                    .filename(sanitizedFilename)
                    .storageKey(storageKey)
                    .url(url)
                    .contentType(file.getContentType())
                    .sizeBytes(file.getSize())
                    .status(AssetStatus.ACTIVE)
                    .version(0L)
                    .build();

            Asset saved = assetRepository.save(asset);
            return assetMapper.toResponse(saved);

        } catch (Exception ex) {
            // Compensating transaction: clean up the physical file if DB save fails
            if (storageKey != null) {
                try {
                    storageService.delete(storageKey);
                } catch (StorageException cleanupEx) {
                    // Log but don't mask the original exception
                }
            }
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponse> getAssetsForWorkspace(UUID workspaceId, Pageable pageable) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        verifyMemberAccess(workspace.getOrganization().getId());
        return assetRepository.findAllByWorkspaceIdAndStatus(workspaceId, AssetStatus.ACTIVE, pageable)
                .map(assetMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponse getAssetById(UUID workspaceId, UUID assetId) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        verifyMemberAccess(workspace.getOrganization().getId());
        Asset asset = findAssetOrThrow(assetId);
        verifyAssetBelongsToWorkspace(asset, workspaceId);
        return assetMapper.toResponse(asset);
    }

    @Override
    @Transactional
    public void deleteAsset(UUID workspaceId, UUID assetId) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        verifyAdminAccess(workspace.getOrganization().getId());
        Asset asset = findAssetOrThrow(assetId);
        verifyAssetBelongsToWorkspace(asset, workspaceId);

        asset.setStatus(AssetStatus.DELETED);
        assetRepository.saveAndFlush(asset);
        
        try {
            storageService.delete(asset.getStorageKey());
        } catch (StorageException ex) {
            // Log but don't fail transaction if physical deletion fails
            // The DB record is correctly marked as DELETED
        }
    }

    @Override
    @Transactional
    public void deleteAllAssetsForWorkspace(UUID workspaceId) {
        List<Asset> assets = assetRepository.findByWorkspaceId(workspaceId);
        for (Asset asset : assets) {
            asset.setStatus(AssetStatus.DELETED);
            assetRepository.saveAndFlush(asset);
            
            try {
                storageService.delete(asset.getStorageKey());
            } catch (StorageException ex) {
                // Best effort physical deletion
            }
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds the maximum allowed limit of 5 MB.");
        }
        try {
            String actualMimeType = tika.detect(file.getInputStream());
            if (actualMimeType == null || !ALLOWED_CONTENT_TYPES.contains(actualMimeType)) {
                throw new BadRequestException(
                        "Unsupported or spoofed file type detected: '" + actualMimeType + "'. Allowed types: " + ALLOWED_CONTENT_TYPES);
            }
        } catch (java.io.IOException e) {
            throw new BadRequestException("Could not read file content to verify type.");
        }
    }

    private Workspace findWorkspaceOrThrow(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));
    }

    private Asset findAssetOrThrow(UUID assetId) {
        return assetRepository.findById(assetId)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + assetId));
    }

    private void verifyAssetBelongsToWorkspace(Asset asset, UUID workspaceId) {
        if (!asset.getWorkspace().getId().equals(workspaceId)) {
            throw new AccessDeniedException("Asset does not belong to the specified workspace.");
        }
    }

    private void verifyAdminAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        OrganizationMember member = memberRepository
                .findByOrganizationIdAndUserId(organizationId, currentUserId)
                .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization."));

        if (member.getRole() != OrganizationRole.OWNER && member.getRole() != OrganizationRole.ADMIN) {
            throw new AccessDeniedException("Only OWNER or ADMIN can manage assets.");
        }
    }

    private void verifyMemberAccess(UUID organizationId) {
        Long currentUserId = currentUserService.getCurrentUserId();
        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, currentUserId)) {
            throw new AccessDeniedException("User is not a member of this organization.");
        }
    }
}
