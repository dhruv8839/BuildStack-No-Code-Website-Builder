package com.buildstack.generation.service;

import com.buildstack.asset.service.StorageService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AssetPackagingService {

    private final StorageService storageService;
    
    // Simplistic regex to match our local asset URL format: /uploads/{workspaceId}/{filename}
    private static final Pattern UPLOAD_URL_PATTERN = Pattern.compile("/uploads/([0-9a-fA-F\\-]+/[a-zA-Z0-9\\.\\-_]+)");

    public AssetPackagingService(StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Replaces internal asset URLs with hashed static site relative URLs (/assets/hash.ext)
     * and returns a map of the new filenames to the actual file byte streams to be packaged.
     */
    public PackagedAssets processHtmlAssets(String html) {
        Map<String, byte[]> assetFiles = new HashMap<>();
        Matcher matcher = UPLOAD_URL_PATTERN.matcher(html);
        StringBuffer updatedHtml = new StringBuffer();

        while (matcher.find()) {
            String storageKey = matcher.group(1);
            try {
                // Read from StorageService
                InputStream is = storageService.getStream(storageKey);
                byte[] data = readAllBytes(is);
                
                // Hash it for cache bursting
                String hash = generateHash(data);
                String extension = getExtension(storageKey);
                String newFilename = "asset-" + hash.substring(0, 8) + "." + extension;
                
                assetFiles.put(newFilename, data);
                
                // Replace URL in HTML
                matcher.appendReplacement(updatedHtml, "/assets/" + newFilename);
            } catch (Exception ex) {
                // If the asset is missing or fails, we leave the URL as is (or it will break)
                // In a stricter system we might fail the generation.
                matcher.appendReplacement(updatedHtml, matcher.group(0));
            }
        }
        matcher.appendTail(updatedHtml);
        
        return new PackagedAssets(updatedHtml.toString(), assetFiles);
    }

    private byte[] readAllBytes(InputStream is) throws IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        int nRead;
        byte[] data = new byte[16384];
        while ((nRead = is.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }
        return buffer.toByteArray();
    }

    private String generateHash(byte[] data) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] encodedhash = digest.digest(data);
        return bytesToHex(encodedhash);
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if(hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            return "bin";
        }
        return filename.substring(dotIndex + 1).toLowerCase();
    }

    public record PackagedAssets(String updatedHtml, Map<String, byte[]> assetsToPackage) {}
}
