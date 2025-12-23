package com.example.urlshortener.controller;

import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.service.HashingService;
import com.example.urlshortener.service.RankingService;
// import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping
public class UrlController {

    private final HashingService hashingService;
    private final RankingService rankingService;
    private final Map<String, UrlMapping> urlStore = new ConcurrentHashMap<>();

    public UrlController(HashingService hashingService, RankingService rankingService) {
        this.hashingService = hashingService;
        this.rankingService = rankingService;
    }

    @PostMapping("/api/shorten")
    public ResponseEntity<UrlMapping> shortenUrl(@RequestParam String url,
            @RequestParam(defaultValue = "MD5") String algorithm) {
        
        // Ensure URL has a protocol, default to https:// if missing
        String normalizedUrl = url;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            normalizedUrl = "https://" + url;
        }
        
        String id = hashingService.shorten(normalizedUrl, algorithm);

        UrlMapping mapping = new UrlMapping(id, normalizedUrl, algorithm);
        urlStore.put(id, mapping);

        return ResponseEntity.ok(mapping);
    }

    @GetMapping("/api/url/{id}")
    public ResponseEntity<UrlMapping> getUrlDetails(@PathVariable String id) {
        UrlMapping mapping = urlStore.get(id);
        if (mapping == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapping);
    }

    @GetMapping("/r/{id}")
    public RedirectView redirect(@PathVariable String id) {
        UrlMapping mapping = urlStore.get(id);
        if (mapping != null) {
            mapping.incrementClickCount();
            return new RedirectView(mapping.getOriginalUrl());
        }
        return new RedirectView("/");
    }

    /**
     * Get top URLs ranked by click count using Min-Heap algorithm.
     * DSA: Priority Queue (Min-Heap) for efficient Top-K selection
     * Time Complexity: O(n log k)
     */
    @GetMapping("/api/rankings")
    public ResponseEntity<List<UrlMapping>> getRankings(
            @RequestParam(defaultValue = "10") int limit) {
        List<UrlMapping> rankings = rankingService.getTopUrlsByClicks(urlStore, limit);
        return ResponseEntity.ok(rankings);
    }

    /**
     * Get ranking statistics
     */
    @GetMapping("/api/rankings/stats")
    public ResponseEntity<Map<String, Object>> getRankingStats() {
        Map<String, Object> stats = rankingService.getRankingStats(urlStore);
        return ResponseEntity.ok(stats);
    }
}
