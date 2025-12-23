# URL Shortener Project - Presentation Script

## 6-Person Division with DSA Topics

---

## Person 1: Project Introduction & Architecture Overview

**Duration: ~5 minutes**

### Script:

> "Good [morning/afternoon], I'll be introducing our URL Shortener project and its overall architecture.

#### What is a URL Shortener?

A URL shortener converts long URLs into short, manageable links. For example, a URL like `https://www.example.com/very/long/path/to/resource?param=value` becomes `http://localhost:8080/r/a1b2c3d4`.

#### Project Architecture

Our project follows the **MVC (Model-View-Controller)** architecture pattern:

- **Model Layer** (`UrlMapping.java`): Stores URL data including ID, original URL, algorithm used, creation date, expiry date, and click count
- **View Layer** (HTML/CSS/JS): Three pages - Home page, Result page, and Rankings page
- **Controller Layer** (`UrlController.java`): Handles HTTP requests and coordinates between services
- **Service Layer** (`HashingService.java`, `RankingService.java`): Contains business logic

#### DSA Topic: HashMap (ConcurrentHashMap)

We use `ConcurrentHashMap` for storing URL mappings:

```java
Map<String, UrlMapping> urlStore = new ConcurrentHashMap<>();
```

**Why ConcurrentHashMap?**

- **Time Complexity**: O(1) average for get, put, remove operations
- **Thread-safe**: Handles concurrent requests without explicit synchronization
- **How it works**: Uses hash function to compute bucket index: `index = hash(key) % buckets`
- **Collision Handling**: Uses separate chaining with linked lists (or trees for large buckets)

#### Data Flow

1. User enters long URL → Frontend sends POST request
2. Controller receives request → Calls HashingService
3. HashingService generates short ID → Stored in ConcurrentHashMap
4. Response sent back → User redirected to result page

> Now I'll hand over to [Person 2] who will explain the hashing algorithms."

---

## Person 2: Hashing Algorithms (HashingService)

**Duration: ~5 minutes**

### Script:

> "Thank you. I'll explain the hashing algorithms we implemented for generating short URLs.

#### What is Hashing?

Hashing is the process of converting input data of any size into a fixed-size output. Our project implements 5 different hashing algorithms.

#### DSA Topic 1: MD5 (Message Digest 5)

```java
MessageDigest md = MessageDigest.getInstance("MD5");
byte[] hashBytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
```

- **Output**: 128-bit (32 hex characters), we take first 8
- **Time Complexity**: O(n) where n is input length
- **How it works**: Divides input into 512-bit blocks, processes through 4 rounds of 16 operations each
- **Use case**: Fast, suitable for non-cryptographic purposes

#### DSA Topic 2: SHA-256 (Secure Hash Algorithm)

```java
MessageDigest md = MessageDigest.getInstance("SHA-256");
```

- **Output**: 256-bit (64 hex characters), we take first 10
- **Time Complexity**: O(n)
- **How it works**: Similar to MD5 but uses 64 rounds, produces longer hash
- **Advantage**: More collision-resistant than MD5

#### DSA Topic 3: CRC32 (Cyclic Redundancy Check)

```java
Checksum checksum = new CRC32();
checksum.update(bytes, 0, bytes.length);
return Long.toHexString(checksum.getValue());
```

- **Output**: 32-bit checksum
- **Time Complexity**: O(n)
- **How it works**: Uses polynomial division with XOR operations
- **Advantage**: Very fast, good for error detection

#### DSA Topic 4: Adler-32

- Similar to CRC32 but uses modular arithmetic
- Faster but slightly less reliable for error detection
- Uses two 16-bit checksums: sum of bytes and sum of sums

#### DSA Topic 5: Base62 Random Generation

```java
private static final String BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
for (int i = 0; i < length; i++) {
    sb.append(BASE62.charAt(random.nextInt(62)));
}
```

- **Time Complexity**: O(k) where k is output length
- **Space**: 62^8 = 218 trillion possible combinations
- **Advantage**: No collision with same input (random each time)

#### Collision Handling

If two different URLs produce the same hash, we can detect it using our HashMap lookup and regenerate. This is handled by the O(1) lookup of ConcurrentHashMap.

> Now [Person 3] will explain the ranking system and Min-Heap algorithm."

---

## Person 3: Ranking System & Min-Heap Algorithm (RankingService)

**Duration: ~5 minutes**

### Script:

> "Thank you. I'll explain the core DSA concept of our project - the **Min-Heap** algorithm used for ranking URLs.

#### Problem Statement

We need to find the Top-K URLs with the highest click counts. With potentially millions of URLs, efficiency is crucial.

#### DSA Topic: Min-Heap (Priority Queue)

**Why Min-Heap instead of sorting?**

| Approach | Time Complexity | Space Complexity |
|----------|-----------------|------------------|
| Full Sort | O(n log n) | O(n) |
| Min-Heap for Top-K | O(n log k) | O(k) |

When k << n (like top 10 from millions), Min-Heap is significantly faster!

#### How Min-Heap Works

```java
PriorityQueue<UrlMapping> minHeap = new PriorityQueue<>(
    Comparator.comparingLong(UrlMapping::getClickCount)
);
```

A Min-Heap is a complete binary tree where:
- Parent node ≤ children nodes
- Root contains the minimum element
- Insert/Delete operations: O(log k)

#### Algorithm Step-by-Step

```
For each URL in urlStore:
    if heap.size < K:
        heap.add(URL)           // O(log k)
    else if URL.clicks > heap.peek().clicks:
        heap.poll()             // Remove minimum - O(log k)
        heap.add(URL)           // Add new URL - O(log k)
```

#### Visual Example

Finding Top-3 from [5, 2, 8, 1, 9, 3, 7]:

| Step | Action | Heap State |
|------|--------|------------|
| 1 | Add 5 | [5] |
| 2 | Add 2 | [2, 5] |
| 3 | Add 8 | [2, 5, 8] |
| 4 | Check 1: 1 < 2 (min) | Skip |
| 5 | Check 9: 9 > 2, replace | [5, 9, 8] |
| 6 | Check 3: 3 < 5 (min) | Skip |
| 7 | Check 7: 7 > 5, replace | [7, 9, 8] |

**Result**: [9, 8, 7] (after sorting descending)

#### Complexity Analysis

- **Time**: O(n log k) - iterate n elements, each heap operation is O(log k)
- **Space**: O(k) - heap stores only k elements
- For n=1,000,000 and k=10: ~3.3M operations vs 20M for full sort

#### Statistics Calculation (Linear Scan)

```java
for (UrlMapping url : urlStore.values()) {
    totalClicks += url.getClickCount();  // O(n)
    maxClicks = Math.max(maxClicks, url.getClickCount());
}
averageClicks = totalClicks / urlStore.size();
```

- Time Complexity: O(n) - single pass through all URLs

> Now [Person 4] will explain the Controller and API endpoints."

---

## Person 4: Controller Layer & REST APIs

**Duration: ~5 minutes**

### Script:

> "Thank you. I'll explain how our REST API endpoints work and the Controller layer.

#### What is REST API?

REST (Representational State Transfer) is an architectural style for designing networked applications using HTTP methods.

#### Our API Endpoints

##### 1. POST /api/shorten - Create Short URL

```java
@PostMapping("/api/shorten")
public ResponseEntity<UrlMapping> shortenUrl(
    @RequestParam String url,
    @RequestParam(defaultValue = "MD5") String algorithm)
```

- Receives long URL and algorithm choice
- Generates short ID using HashingService
- Stores in ConcurrentHashMap
- Returns UrlMapping object with all details

#### DSA Topic: URL Normalization

```java
if (!url.startsWith("http://") && !url.startsWith("https://")) {
    normalizedUrl = "https://" + url;
}
```

- **String matching**: O(k) where k is prefix length
- Ensures consistent URL format

##### 2. GET /r/{id} - Redirect to Original URL

```java
@GetMapping("/r/{id}")
public RedirectView redirect(@PathVariable String id) {
    UrlMapping mapping = urlStore.get(id);  // O(1) HashMap lookup
    if (mapping != null) {
        mapping.incrementClickCount();  // O(1) counter increment
        return new RedirectView(mapping.getOriginalUrl());
    }
}
```

#### DSA Topic: HashMap Lookup

- `urlStore.get(id)` is O(1) average case
- Hash function computes bucket: `bucket = hash(id) % size`
- Direct access to stored URL

##### 3. GET /api/url/{id} - Get URL Details

- Returns full UrlMapping object for result page
- Used to display creation time, expiry, clicks

##### 4. GET /api/rankings - Get Top URLs

```java
@GetMapping("/api/rankings")
public ResponseEntity<List<UrlMapping>> getRankings(
    @RequestParam(defaultValue = "10") int limit)
```

- Calls RankingService.getTopUrlsByClicks()
- Uses Min-Heap algorithm (explained by Person 3)

##### 5. GET /api/rankings/stats - Get Statistics

- Returns totalUrls, totalClicks, averageClicks
- Linear scan O(n) through all URLs

#### DSA Topic: Dependency Injection Pattern

```java
public UrlController(HashingService hashingService, RankingService rankingService) {
    this.hashingService = hashingService;
    this.rankingService = rankingService;
}
```

- Loose coupling between components
- Easier testing and maintenance

> Now [Person 5] will explain the Data Model and frontend implementation."

---

## Person 5: Data Model & Frontend Implementation

**Duration: ~5 minutes**

### Script:

> "Thank you. I'll explain our data model and the frontend pages.

#### UrlMapping Model (Data Structure)

```java
public class UrlMapping {
    private String id;           // Short URL identifier
    private String originalUrl;  // Original long URL
    private String algorithm;    // Hashing algorithm used
    private LocalDateTime createdDate;
    private LocalDateTime expiryDate;
    private long clickCount;
}
```

#### DSA Topic: Object-Oriented Data Structure

- **Encapsulation**: All fields private with getters/setters
- **Time fields**: Use `LocalDateTime` for precise timestamps
- **clickCount**: Uses `long` to handle high traffic (up to 9.2 quintillion)

#### Expiry Calculation

```java
this.expiryDate = this.createdDate.plusDays(30);
```

- Automatic 30-day expiry from creation
- Date arithmetic handled by Java Time API

#### Frontend Pages

##### 1. Home Page (index.html + script.js)

- Input field for long URL
- Algorithm selection dropdown
- Shorten button triggers API call
- On success, redirects to result page

#### DSA Topic: Event-Driven Programming

```javascript
async function shortenUrl() {
    const response = await fetch(`/api/shorten?url=${encodeURIComponent(originalUrl)}&algorithm=${algorithm}`, {
        method: 'POST'
    });
    // Store data and redirect
    sessionStorage.setItem('urlData', JSON.stringify(data));
    window.location.href = `/result.html?id=${data.id}`;
}
```

##### 2. Result Page (result.html + result.js)

- Displays short URL with copy button
- Shows creation and expiry timestamps
- Live countdown timer
- QR code generation
- Click analytics

#### DSA Topic: Countdown Timer Algorithm

```javascript
const updateCountdown = () => {
    const diff = expiry - now;  // Milliseconds difference
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    // ... minutes, seconds
}
setInterval(updateCountdown, 1000);  // Update every second
```

- **Time Complexity**: O(1) per update
- **Mathematical division** to extract time components

##### 3. Ranking Page (ranking.html + ranking.js)

- Displays top 10 URLs by clicks
- Shows total URLs, total clicks, average clicks
- Real-time refresh capability

#### DSA Topic: Parallel API Calls

```javascript
const [rankingsRes, statsRes] = await Promise.all([
    fetch("/api/rankings?limit=10"),
    fetch("/api/rankings/stats"),
]);
```

- Fetches rankings and stats simultaneously
- Reduces total wait time

> Now [Person 6] will explain the UI/UX design and styling."

---

## Person 6: UI/UX Design, Styling & Project Summary

**Duration: ~5 minutes**

### Script:

> "Thank you. I'll explain our UI/UX design decisions and provide the project summary.

#### Design Philosophy: Glassmorphism

Our UI uses the modern 'glassmorphism' design trend:

```css
.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
}
```

- Semi-transparent backgrounds
- Blur effects for depth
- Gradient accents

#### DSA Topic: CSS Animation Algorithms

##### 1. Floating Shapes Animation

```css
@keyframes float {
    0% { transform: translate(0, 0); }
    100% { transform: translate(30px, 30px); }
}
```

- Uses **linear interpolation** for smooth movement
- CSS engine calculates intermediate positions

##### 2. Staggered Row Animation (Ranking Table)

```javascript
row.style.animationDelay = `${index * 0.1}s`;
```

```css
@keyframes fadeInRow {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
}
```

- **Array indexing**: Each row's delay = index × 0.1 seconds
- Creates cascading visual effect

#### DSA Topic: Conditional Scrollbar (Dynamic UI)

```css
.ranking-table-container {
    max-height: 400px;
    overflow-y: auto;
}
.ranking-table-container.no-scroll {
    overflow-y: hidden;
}
```

```javascript
if (rankings.length === 0) {
    tableContainer.classList.add("no-scroll");
} else {
    tableContainer.classList.remove("no-scroll");
}
```

- **Conditional logic**: Show scrollbar only when content exceeds container

#### Responsive Design

```css
@media (max-width: 500px) {
    .details-grid { grid-template-columns: 1fr; }
    .action-buttons { flex-direction: column; }
}
```

- **Adaptive layout** based on screen width
- Grid/Flexbox adjustments for mobile

---

## Project Summary

### DSA Concepts Used

| DSA Concept | Where Used | Time Complexity |
|-------------|------------|-----------------|
| HashMap (ConcurrentHashMap) | URL Storage | O(1) avg |
| Min-Heap (PriorityQueue) | Top-K Rankings | O(n log k) |
| MD5/SHA-256 Hashing | URL Shortening | O(n) |
| CRC32/Adler-32 Checksum | URL Shortening | O(n) |
| Linear Scan | Statistics Calculation | O(n) |
| String Manipulation | URL Normalization | O(k) |

### Technology Stack

- **Backend**: Java, Spring Boot
- **Frontend**: HTML5, CSS3, JavaScript
- **Data Structure**: In-memory ConcurrentHashMap

### Future Enhancements

- Database persistence (MySQL/MongoDB)
- User authentication
- Custom short URL aliases
- URL expiry management with TTL

> Thank you! We're now open for questions."

---

## Quick Reference: Person-Topic Assignment

| Person | Topic | DSA Concepts | Files Covered |
|--------|-------|--------------|---------------|
| **1** | Project Intro & Architecture | HashMap, ConcurrentHashMap, O(1) operations | UrlController.java, UrlMapping.java |
| **2** | Hashing Algorithms | MD5, SHA-256, CRC32, Adler-32, Base62 | HashingService.java |
| **3** | Ranking System | Min-Heap, Priority Queue, O(n log k) | RankingService.java |
| **4** | REST APIs & Controller | HashMap Lookup, URL Normalization, Dependency Injection | UrlController.java |
| **5** | Data Model & Frontend | Object-Oriented Design, Event-Driven, Parallel Async Calls | UrlMapping.java, script.js, result.js |
| **6** | UI/UX & Summary | CSS Animations, Conditional Logic, Linear Interpolation | style.css, ranking.js |

---

## Project File Structure

```
url-shortener/
├── src/main/java/com/example/urlshortener/
│   ├── UrlShortenerApplication.java    # Main entry point
│   ├── controller/
│   │   └── UrlController.java          # REST API endpoints
│   ├── model/
│   │   └── UrlMapping.java             # Data model
│   └── service/
│       ├── HashingService.java         # Hashing algorithms
│       └── RankingService.java         # Min-Heap ranking
├── src/main/resources/static/
│   ├── index.html                      # Home page
│   ├── result.html                     # Result page
│   ├── ranking.html                    # Rankings page
│   ├── script.js                       # Home page JS
│   ├── result.js                       # Result page JS
│   ├── ranking.js                      # Rankings page JS
│   └── style.css                       # Global styles
├── pom.xml                             # Maven configuration
└── README.md                           # Project documentation
```
