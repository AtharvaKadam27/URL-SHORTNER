package com.example.urlshortener.model;

import java.time.LocalDateTime;

public class UrlMapping {
    private String id;
    private String originalUrl;
    private String algorithm;
    private LocalDateTime createdDate;
    private LocalDateTime expiryDate;
    private long clickCount;

    public UrlMapping() {}

    public UrlMapping(String id, String originalUrl, String algorithm) {
        this.id = id;
        this.originalUrl = originalUrl;
        this.algorithm = algorithm;
        this.createdDate = LocalDateTime.now();
        this.expiryDate = this.createdDate.plusDays(30); // Default 30 days expiry
        this.clickCount = 0;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public long getClickCount() {
        return clickCount;
    }

    public void setClickCount(long clickCount) {
        this.clickCount = clickCount;
    }

    public void incrementClickCount() {
        this.clickCount++;
    }
}
