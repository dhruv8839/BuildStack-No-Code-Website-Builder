package com.buildstack.asset.service;

import com.buildstack.asset.dto.AssetResponse;
import com.buildstack.asset.entity.Asset;
import com.buildstack.asset.enums.AssetStatus;
import com.buildstack.asset.mapper.AssetMapper;
import com.buildstack.asset.repository.AssetRepository;
import com.buildstack.asset.service.impl.AssetServiceImpl;
import com.buildstack.common.security.CurrentUserService;
import com.buildstack.exception.BadRequestException;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.OrganizationMember;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.enums.OrganizationRole;
import com.buildstack.organization.repository.OrganizationMemberRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock private AssetRepository assetRepository;
    @Mock private WorkspaceRepository workspaceRepository;
    @Mock private OrganizationMemberRepository memberRepository;
    @Mock private StorageService storageService;
    @Mock private AssetMapper assetMapper;
    @Mock private CurrentUserService currentUserService;

    @InjectMocks
    private AssetServiceImpl assetService;

    private UUID workspaceId;
    private Workspace workspace;
    private final Long userId = 1L;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();

        Organization org = new Organization();
        org.setId(orgId);

        workspace = new Workspace();
        workspace.setId(workspaceId);
        workspace.setOrganization(org);

        OrganizationMember adminMember = new OrganizationMember();
        adminMember.setRole(OrganizationRole.ADMIN);

        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(workspaceRepository.findById(workspaceId)).thenReturn(Optional.of(workspace));
        // Use lenient to allow per-test override without UnnecessaryStubbingException
        lenient().when(memberRepository.findByOrganizationIdAndUserId(orgId, userId)).thenReturn(Optional.of(adminMember));
    }

    @Test
    void shouldUploadAssetSuccessfully() {
        byte[] validPng = new byte[] { (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0, 0, 0, 0, 0 };
        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", validPng);

        String storageKey = workspaceId + "/" + UUID.randomUUID() + ".png";
        when(storageService.store(eq(workspaceId), any(UUID.class), eq(file))).thenReturn(storageKey);
        when(storageService.resolveUrl(storageKey)).thenReturn("http://localhost:8080/uploads/" + storageKey);

        Asset savedAsset = new Asset();
        savedAsset.setId(UUID.randomUUID());
        savedAsset.setWorkspace(workspace);
        savedAsset.setFilename("logo.png");
        savedAsset.setStatus(AssetStatus.ACTIVE);
        when(assetRepository.save(any(Asset.class))).thenReturn(savedAsset);

        AssetResponse response = new AssetResponse(
                savedAsset.getId(), workspaceId, "logo.png",
                "http://localhost:8080/uploads/" + storageKey,
                "image/png", 1024L, null, null, AssetStatus.ACTIVE, null);
        when(assetMapper.toResponse(savedAsset)).thenReturn(response);

        AssetResponse result = assetService.uploadAsset(workspaceId, file);

        assertThat(result).isNotNull();
        assertThat(result.filename()).isEqualTo("logo.png");
        assertThat(result.status()).isEqualTo(AssetStatus.ACTIVE);
        verify(storageService).store(eq(workspaceId), any(UUID.class), eq(file));
        verify(assetRepository).save(any(Asset.class));
    }

    @Test
    void shouldRejectFileTooLarge() {
        byte[] bigContent = new byte[6 * 1024 * 1024]; // 6 MB
        MockMultipartFile file = new MockMultipartFile(
                "file", "big.png", "image/png", bigContent);

        assertThrows(BadRequestException.class, () -> assetService.uploadAsset(workspaceId, file));
        verifyNoInteractions(storageService);
    }

    @Test
    void shouldRejectUnsupportedContentType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "script.js", "application/javascript", new byte[100]);

        assertThrows(BadRequestException.class, () -> assetService.uploadAsset(workspaceId, file));
        verifyNoInteractions(storageService);
    }

    @Test
    void shouldDenyUploadForMemberRole() {
        OrganizationMember memberRole = new OrganizationMember();
        memberRole.setRole(OrganizationRole.MEMBER);
        when(memberRepository.findByOrganizationIdAndUserId(any(), eq(userId))).thenReturn(Optional.of(memberRole));

        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", new byte[512]);

        assertThrows(AccessDeniedException.class, () -> assetService.uploadAsset(workspaceId, file));
        verifyNoInteractions(storageService);
    }

    @Test
    void shouldDeleteAssetSuccessfully() {
        UUID assetId = UUID.randomUUID();
        Asset asset = new Asset();
        asset.setId(assetId);
        asset.setWorkspace(workspace);
        asset.setStorageKey(workspaceId + "/" + assetId + ".png");

        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));

        assetService.deleteAsset(workspaceId, assetId);

        verify(storageService).delete(asset.getStorageKey());
        verify(assetRepository).saveAndFlush(asset);
        assertThat(asset.getStatus()).isEqualTo(AssetStatus.DELETED);
    }
}
