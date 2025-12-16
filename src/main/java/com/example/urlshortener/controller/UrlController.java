package com.example.urlshortener.controller;

import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.service.HashingService;
// import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping
public class UrlController {

    private final HashingService hashingService;
    private final Map<String, UrlMapping> urlStore = new ConcurrentHashMap<>();

    public UrlController(HashingService hashingService) {
        this.hashingService = hashingService;
    }

    @PostMapping("/api/shorten")
    public ResponseEntity<UrlMapping> shortenUrl(@RequestParam String url,
            @RequestParam(defaultValue = "MD5") String algorithm) {
        String id = hashingService.shorten(url, algorithm);

        UrlMapping mapping = new UrlMapping(id, url, algorithm);
        urlStore.put(id, mapping);

        return ResponseEntity.ok(mapping);
    }

    @GetMapping("/{id:[^\\.]+}")
    public RedirectView redirect(@PathVariable String id) {
        UrlMapping mapping = urlStore.get(id);
        if (mapping != null) {
            String originalUrl = mapping.getOriginalUrl();
            if (!originalUrl.startsWith("http")) {
                originalUrl = "http://" + originalUrl;
            }
            return new RedirectView(originalUrl);
        } else {
            return new RedirectView("/?error=notfound");
        }
    }
}
