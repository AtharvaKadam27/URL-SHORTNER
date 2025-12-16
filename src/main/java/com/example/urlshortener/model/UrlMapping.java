package com.example.urlshortener.model;

import java.time.LocalDateTime;

public class UrlMapping {
    private String id;
    private String originalUrl;
    private String algorithm;
    private LocalDateTime createdDate;

    public UrlMapping() {}

    public UrlMapping(String id, String originalUrl, String algorithm) {
        this.id = id;
        this.originalUrl = originalUrl;
        this.algorithm = algorithm;
        this.createdDate = LocalDateTime.now();
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
}
