package com.buildstack.generation.service;

import com.buildstack.project.entity.Page;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouteGeneratorServiceTest {

    private final RouteGeneratorService routeGeneratorService = new RouteGeneratorService();

    @Test
    void generateSitemap_Success() {
        Page p1 = new Page();
        p1.setHomePage(true);
        p1.setSlug("home");

        Page p2 = new Page();
        p2.setHomePage(false);
        p2.setSlug("about");

        String sitemap = routeGeneratorService.generateSitemap("https://example.com", Set.of(p1, p2));

        assertTrue(sitemap.contains("<loc>https://example.com/</loc>"));
        assertTrue(sitemap.contains("<loc>https://example.com/about</loc>"));
    }

    @Test
    void getFilePath_Success() {
        Page p1 = new Page();
        p1.setHomePage(true);
        p1.setSlug("home");

        Page p2 = new Page();
        p2.setHomePage(false);
        p2.setSlug("about");

        assertEquals("index.html", routeGeneratorService.getFilePath(p1));
        assertEquals("about/index.html", routeGeneratorService.getFilePath(p2));
    }
}
