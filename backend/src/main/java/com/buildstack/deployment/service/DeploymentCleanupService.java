package com.buildstack.deployment.service;

import com.buildstack.deployment.entity.Deployment;
import com.buildstack.deployment.enums.DeploymentStatus;
import com.buildstack.deployment.enums.DeploymentType;
import com.buildstack.deployment.repository.DeploymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentCleanupService {

    private final DeploymentRepository deploymentRepository;

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredPreviews() {
        log.info("Starting cleanup of expired preview deployments");
        
        List<Deployment> expiredPreviews = deploymentRepository.findByTypeAndStatusAndExpiresAtBefore(
                DeploymentType.PREVIEW, DeploymentStatus.ACTIVE, Instant.now());
                
        for (Deployment deployment : expiredPreviews) {
            deployment.setStatus(DeploymentStatus.EXPIRED);
            deployment.setCompletedAt(Instant.now()); // Record when it expired
            deploymentRepository.save(deployment);
            log.info("Expired preview deployment: {}", deployment.getId());
        }
        
        log.info("Finished cleanup. Expired {} preview deployments.", expiredPreviews.size());
    }
}
