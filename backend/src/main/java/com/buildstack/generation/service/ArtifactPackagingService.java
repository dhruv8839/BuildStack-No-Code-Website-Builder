package com.buildstack.generation.service;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ArtifactPackagingService {

    /**
     * Packages the given files into a ZIP archive along with a manifest.json.
     * @param htmlFiles Map of filePath (e.g. index.html) to HTML string content.
     * @param cssContent The combined styles.css string.
     * @param assets Map of filename (e.g. asset-hash.png) to byte content.
     * @param sitemapXml The generated sitemap.xml content.
     * @param robotsTxt The generated robots.txt content.
     * @param versionNumber The version number to embed in manifest.
     * @return The ZIP archive as a byte array, along with its SHA-256 hash.
     */
    public PackageResult createPackage(Map<String, String> htmlFiles, 
                                     String cssContent, 
                                     Map<String, byte[]> assets,
                                     String sitemapXml,
                                     String robotsTxt,
                                     int versionNumber) throws IOException, NoSuchAlgorithmException {
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {

            // Add HTML files
            for (Map.Entry<String, String> entry : htmlFiles.entrySet()) {
                addEntry(zos, entry.getKey(), entry.getValue().getBytes(StandardCharsets.UTF_8));
            }

            // Add CSS
            addEntry(zos, "css/styles.css", cssContent.getBytes(StandardCharsets.UTF_8));

            // Add Assets
            for (Map.Entry<String, byte[]> entry : assets.entrySet()) {
                addEntry(zos, "assets/" + entry.getKey(), entry.getValue());
            }

            // Add Sitemap & Robots
            addEntry(zos, "sitemap.xml", sitemapXml.getBytes(StandardCharsets.UTF_8));
            addEntry(zos, "robots.txt", robotsTxt.getBytes(StandardCharsets.UTF_8));

            // Generate and Add Manifest
            String manifest = generateManifest(htmlFiles.keySet(), assets.keySet(), versionNumber);
            addEntry(zos, "manifest.json", manifest.getBytes(StandardCharsets.UTF_8));
        }

        byte[] zipData = baos.toByteArray();
        String checksum = generateHash(zipData);
        
        return new PackageResult(zipData, checksum, (long) zipData.length);
    }

    private void addEntry(ZipOutputStream zos, String path, byte[] data) throws IOException {
        ZipEntry entry = new ZipEntry(path);
        zos.putNextEntry(entry);
        zos.write(data);
        zos.closeEntry();
    }

    private String generateManifest(java.util.Set<String> htmlFiles, java.util.Set<String> assets, int versionNumber) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"version\": ").append(versionNumber).append(",\n");
        sb.append("  \"generatedAt\": \"").append(Instant.now().toString()).append("\",\n");
        sb.append("  \"files\": [\n");
        
        boolean first = true;
        for (String file : htmlFiles) {
            if (!first) sb.append(",\n");
            sb.append("    \"").append(file).append("\"");
            first = false;
        }
        sb.append(",\n    \"css/styles.css\"");
        for (String asset : assets) {
            sb.append(",\n    \"assets/").append(asset).append("\"");
        }
        sb.append(",\n    \"sitemap.xml\"");
        sb.append(",\n    \"robots.txt\"");
        sb.append(",\n    \"manifest.json\"");
        
        sb.append("\n  ]\n}");
        return sb.toString();
    }

    private String generateHash(byte[] data) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] encodedhash = digest.digest(data);
        StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
        for (byte b : encodedhash) {
            String hex = Integer.toHexString(0xff & b);
            if(hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public record PackageResult(byte[] data, String checksum, Long sizeBytes) {}
}
