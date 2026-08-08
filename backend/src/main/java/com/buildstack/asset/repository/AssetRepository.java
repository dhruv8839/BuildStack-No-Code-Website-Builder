package com.buildstack.asset.repository;

import com.buildstack.asset.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AssetRepository extends JpaRepository<Asset, UUID> {

    Page<Asset> findAllByWorkspaceIdAndStatus(UUID workspaceId, com.buildstack.asset.enums.AssetStatus status, Pageable pageable);
    
    java.util.List<Asset> findByWorkspaceId(UUID workspaceId);
}
