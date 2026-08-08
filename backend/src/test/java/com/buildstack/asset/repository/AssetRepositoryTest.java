package com.buildstack.asset.repository;

import com.buildstack.asset.entity.Asset;
import com.buildstack.asset.enums.AssetStatus;
import com.buildstack.auth.entity.User;
import com.buildstack.auth.repository.UserRepository;
import com.buildstack.config.TestBase;
import com.buildstack.organization.entity.Organization;
import com.buildstack.organization.entity.Workspace;
import com.buildstack.organization.repository.OrganizationRepository;
import com.buildstack.organization.repository.WorkspaceRepository;
import com.buildstack.util.TestFixtures;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AssetRepositoryTest extends TestBase {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private UserRepository userRepository;

    private Workspace testWorkspace;

    @BeforeEach
    void setUp() {
        assetRepository.deleteAll();
        workspaceRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        User user = userRepository.save(TestFixtures.createTestUser(null, "asset@test.com"));
        Organization org = organizationRepository.save(TestFixtures.createTestOrganization(null, "asset-org", user));
        testWorkspace = workspaceRepository.save(TestFixtures.createTestWorkspace(null, "ASSETWS", org));
    }

    @Test
    void shouldSaveAssetSuccessfully() {
        Asset asset = TestFixtures.createTestAsset(null, testWorkspace);
        Asset saved = assetRepository.save(asset);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getWorkspace().getId()).isEqualTo(testWorkspace.getId());
        assertThat(saved.getStatus()).isEqualTo(AssetStatus.ACTIVE);
    }

    @Test
    void shouldFindAssetsByWorkspaceId() {
        Asset a1 = TestFixtures.createTestAsset(null, testWorkspace);
        Asset a2 = TestFixtures.createTestAsset(null, testWorkspace);
        a2.setStorageKey(UUID.randomUUID() + "/asset2.png");  // ensure unique storage key
        assetRepository.save(a1);
        assetRepository.save(a2);

        Page<Asset> result = assetRepository.findAllByWorkspaceIdAndStatus(testWorkspace.getId(), AssetStatus.ACTIVE, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(2);
    }

    @Test
    void shouldReturnEmptyPageForUnknownWorkspace() {
        Page<Asset> result = assetRepository.findAllByWorkspaceIdAndStatus(UUID.randomUUID(), AssetStatus.ACTIVE, PageRequest.of(0, 10));
        assertThat(result.getContent()).isEmpty();
    }
}
