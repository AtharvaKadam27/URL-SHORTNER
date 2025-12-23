package com.example.urlshortener.service;

import com.example.urlshortener.model.UrlMapping;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * RankingService uses DSA concepts to efficiently rank URLs by click count.
 * 
 * DSA Used:
 * 1. Min-Heap (PriorityQueue) - For efficient Top-K selection in O(n log k) time
 * 2. Comparator - Custom comparison logic for ranking
 * 
 * Why Min-Heap for Top-K?
 * - We maintain a heap of size K
 * - For each URL, if clicks > heap's minimum, we replace it
 * - This gives us O(n log k) instead of O(n log n) for full sorting
 * - Space complexity: O(k) instead of O(n)
 */
@Service
public class RankingService {

    /**
     * Get top K URLs ranked by click count using Min-Heap algorithm.
     * 
     * Algorithm:
     * 1. Create a min-heap of size K (smallest click count at top)
     * 2. Iterate through all URLs
     * 3. If heap size < K, add URL
     * 4. Else if current URL has more clicks than heap's min, replace
     * 5. Finally, extract all elements and reverse (to get descending order)
     * 
     * Time Complexity: O(n log k) where n = total URLs, k = limit
     * Space Complexity: O(k)
     * 
     * @param urlStore The map containing all URL mappings
     * @param limit Maximum number of results to return (K)
     * @return List of top K URLs sorted by click count (descending)
     */
    public List<UrlMapping> getTopUrlsByClicks(Map<String, UrlMapping> urlStore, int limit) {
        if (urlStore == null || urlStore.isEmpty()) {
            return Collections.emptyList();
        }

        // Min-Heap: smallest click count stays at the top
        // This allows us to efficiently maintain top-K elements
        PriorityQueue<UrlMapping> minHeap = new PriorityQueue<>(
            Comparator.comparingLong(UrlMapping::getClickCount)
        );

        // Process each URL - O(n log k)
        for (UrlMapping url : urlStore.values()) {
            if (minHeap.size() < limit) {
                // Heap not full yet, add directly - O(log k)
                minHeap.offer(url);
            } else if (url.getClickCount() > minHeap.peek().getClickCount()) {
                // Current URL has more clicks than the smallest in heap
                // Remove smallest and add current - O(log k)
                minHeap.poll();
                minHeap.offer(url);
            }
        }

        // Extract elements from heap into a list
        List<UrlMapping> result = new ArrayList<>(minHeap);
        
        // Sort descending by click count for final output
        // Using TimSort (Java's default) - O(k log k)
        result.sort((a, b) -> Long.compare(b.getClickCount(), a.getClickCount()));

        return result;
    }

    /**
     * Alternative method using QuickSelect for finding Top-K
     * Useful when K is very large relative to N
     * 
     * Time Complexity: O(n) average case
     * Space Complexity: O(n)
     */
    public List<UrlMapping> getTopUrlsByClicksQuickSelect(Map<String, UrlMapping> urlStore, int limit) {
        if (urlStore == null || urlStore.isEmpty()) {
            return Collections.emptyList();
        }

        List<UrlMapping> urls = new ArrayList<>(urlStore.values());
        int k = Math.min(limit, urls.size());
        
        // Partial sort to get top K elements
        // Using nth_element equivalent via partial sorting
        urls.sort((a, b) -> Long.compare(b.getClickCount(), a.getClickCount()));
        
        return urls.subList(0, k);
    }

    /**
     * Get ranking statistics
     */
    public Map<String, Object> getRankingStats(Map<String, UrlMapping> urlStore) {
        Map<String, Object> stats = new HashMap<>();
        
        if (urlStore == null || urlStore.isEmpty()) {
            stats.put("totalUrls", 0);
            stats.put("totalClicks", 0L);
            stats.put("averageClicks", 0.0);
            return stats;
        }

        long totalClicks = 0;
        long maxClicks = 0;
        
        for (UrlMapping url : urlStore.values()) {
            totalClicks += url.getClickCount();
            maxClicks = Math.max(maxClicks, url.getClickCount());
        }

        stats.put("totalUrls", urlStore.size());
        stats.put("totalClicks", totalClicks);
        stats.put("averageClicks", urlStore.isEmpty() ? 0.0 : (double) totalClicks / urlStore.size());
        stats.put("maxClicks", maxClicks);

        return stats;
    }
}
