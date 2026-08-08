package com.buildstack.generation.service;

import com.buildstack.generation.event.ArtifactCreatedEvent;
import com.buildstack.generation.event.SiteGenerationCompletedEvent;
import com.buildstack.generation.event.SiteGenerationStartedEvent;
import com.buildstack.generation.validation.GenerationValidator;
import com.buildstack.project.entity.Page;
import com.buildstack.publishing.entity.ArtifactMetadata;
import com.buildstack.publishing.entity.PublishHistory;
import com.buildstack.publishing.entity.PublishJob;
import com.buildstack.publishing.entity.WebsiteVersion;
import com.buildstack.publishing.enums.PublishJobStatus;
import com.buildstack.publishing.enums.PublishResult;
import com.buildstack.publishing.event.PublishStartedEvent;
import com.buildstack.publishing.repository.ArtifactMetadataRepository;
import com.buildstack.publishing.repository.PublishHistoryRepository;
import com.buildstack.publishing.repository.PublishJobRepository;
import com.buildstack.publishing.repository.WebsiteVersionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaticSiteGeneratorService {

    private final PublishJobRepository publishJobRepository;
    private final WebsiteVersionRepository websiteVersionRepository;
    private final PublishHistoryRepository publishHistoryRepository;
    private final ArtifactMetadataRepository artifactMetadataRepository;
    
    private final GenerationValidator generationValidator;
    private final PropertyCompilerService propertyCompilerService;
    private final ComponentRendererService componentRendererService;
    private final RouteGeneratorService routeGeneratorService;
    private final AssetPackagingService assetPackagingService;
    private final ArtifactPackagingService artifactPackagingService;
    private final ArtifactStorageService artifactStorageService;
    
    private final ApplicationEventPublisher eventPublisher;

    @Async
    @EventListener
    @Transactional
    public void handlePublishStarted(PublishStartedEvent event) {
        log.info("Starting site generation for job {}", event.publishJobId());
        
        Optional<PublishJob> jobOpt = publishJobRepository.findById(event.publishJobId());
        if (jobOpt.isEmpty()) return;
        
        PublishJob job = jobOpt.get();
        job.setStatus(PublishJobStatus.BUILDING);
        job.setProgress(10);
        publishJobRepository.save(job);
        
        eventPublisher.publishEvent(new SiteGenerationStartedEvent(job.getId(), job.getWebsiteVersion().getId()));

        try {
            WebsiteVersion version = websiteVersionRepository.findById(event.websiteVersionId())
                    .orElseThrow(() -> new IllegalStateException("Version not found"));
            
            // 1. Validation
            generationValidator.validate(version);
            job.setProgress(20);
            publishJobRepository.save(job);

            // 2. CSS Generation
            // Aggregate all components across all pages
            java.util.Set<com.buildstack.component.entity.Component> allComponents = new java.util.HashSet<>();
            for (Page page : version.getProject().getPages()) {
                if (page.getComponents() != null) {
                    allComponents.addAll(page.getComponents());
                }
            }
            String cssContent = propertyCompilerService.compileCss(allComponents);
            job.setProgress(40);
            publishJobRepository.save(job);

            // 3. HTML and Assets Generation
            Map<String, String> htmlFiles = new HashMap<>();
            Map<String, byte[]> allAssets = new HashMap<>();
            
            String domain = version.getProject().getCustomDomain() != null ? 
                    "https://" + version.getProject().getCustomDomain() : 
                    "https://" + version.getProject().getSlug() + ".buildstack.com";

            for (Page page : version.getProject().getPages()) {
                // Render component tree to raw HTML
                String rawHtml = "";
                if (page.getComponents() != null && !page.getComponents().isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (com.buildstack.component.entity.Component c : page.getComponents()) {
                        sb.append(componentRendererService.render(c));
                    }
                    rawHtml = sb.toString();
                }

                // Process assets in HTML
                AssetPackagingService.PackagedAssets packaged = assetPackagingService.processHtmlAssets(rawHtml);
                allAssets.putAll(packaged.assetsToPackage());

                // Wrap in full HTML document
                String fullHtml = routeGeneratorService.wrapHtml(page.getTitle(), packaged.updatedHtml());
                htmlFiles.put(routeGeneratorService.getFilePath(page), fullHtml);
            }
            
            job.setProgress(70);
            publishJobRepository.save(job);

            // 4. Routes (Sitemap, Robots)
            String sitemapXml = routeGeneratorService.generateSitemap(domain, version.getProject().getPages());
            String robotsTxt = routeGeneratorService.generateRobotsTxt(domain);

            // 5. Package Artifact
            ArtifactPackagingService.PackageResult pkg = artifactPackagingService.createPackage(
                    htmlFiles, cssContent, allAssets, sitemapXml, robotsTxt, version.getVersionNumber());
            
            job.setProgress(90);
            publishJobRepository.save(job);

            // 6. Store Artifact
            String storageKey = artifactStorageService.storeArtifact(version.getId(), pkg.data());

            // 7. Update History & Job
            PublishHistory history = new PublishHistory();
            history.setWebsiteVersion(version);
            history.setAuthor(job.getTriggeredBy());
            history.setMessage("Generated version " + version.getVersionNumber());
            history.setResult(PublishResult.SUCCESS);
            history.setPublishedAt(Instant.now());
            history = publishHistoryRepository.save(history);

            ArtifactMetadata metadata = new ArtifactMetadata();
            metadata.setPublishHistory(history);
            metadata.setChecksum(pkg.checksum());
            metadata.setBuildHash(pkg.checksum()); // simplified for now
            metadata.setSizeBytes(pkg.sizeBytes());
            metadata = artifactMetadataRepository.save(metadata);
            
            job.setStatus(PublishJobStatus.SUCCESS);
            job.setProgress(100);
            job.setCompletedAt(Instant.now());
            publishJobRepository.save(job);
            
            eventPublisher.publishEvent(new SiteGenerationCompletedEvent(job.getId(), version.getId()));
            eventPublisher.publishEvent(new ArtifactCreatedEvent(job.getId(), metadata.getId()));

        } catch (Exception ex) {
            log.error("Generation failed", ex);
            job.setStatus(PublishJobStatus.FAILED);
            job.setErrorMessage(ex.getMessage());
            job.setCompletedAt(Instant.now());
            publishJobRepository.save(job);
        }
    }
}
