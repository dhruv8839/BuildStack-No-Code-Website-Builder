package com.buildstack.generation.service;

import com.buildstack.project.entity.Page;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class RouteGeneratorService {

    public String generateSitemap(String domain, Set<Page> pages) {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        for (Page page : pages) {
            sb.append("  <url>\n");
            sb.append("    <loc>").append(domain).append(getRoute(page)).append("</loc>\n");
            sb.append("  </url>\n");
        }

        sb.append("</urlset>\n");
        return sb.toString();
    }

    public String generateRobotsTxt(String domain) {
        return "User-agent: *\nAllow: /\n\nSitemap: " + domain + "/sitemap.xml\n";
    }

    public String getRoute(Page page) {
        if (page.isHomePage()) {
            return "/";
        }
        return "/" + page.getSlug();
    }

    public String getFilePath(Page page) {
        if (page.isHomePage()) {
            return "index.html";
        }
        return page.getSlug() + "/index.html";
    }

    public String wrapHtml(String title, String bodyHtml) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>" + (title != null ? title : "BuildStack Website") + "</title>\n" +
                "  <link rel=\"stylesheet\" href=\"/css/styles.css\">\n" +
                "</head>\n" +
                "<body>\n" +
                bodyHtml + "\n" +
                "</body>\n" +
                "</html>";
    }
}
