# Java URL Shortener

An advanced URL shortener application built with Java Spring Boot and a premium glassmorphism UI.

## Features
- **Multiple Hashing Algorithms**: Choose from MD5, SHA-256, CRC32, Adler32, or Base62.
- **Advanced UI**: Modern, responsive interface with glassmorphism effects and animations.
- **In-Memory Storage**: Fast and simple URL mapping using concurrent data structures.

## Prerequisites
- Java 8 or higher.
- Maven (optional, but recommended for building).

## How to Run

### Using Maven (Recommended)
1. Open a terminal in the project root.
2. Run the application:
   ```sh
   mvn spring-boot:run
   ```
3. Open your browser and go to: `http://localhost:8080`

### Building JAR
1. Build the project:
   ```sh
   mvn clean package
   ```
2. Run the generated JAR:
   ```sh
   java -jar target/url-shortener-0.0.1-SNAPSHOT.jar
   ```

## API Usage
- **Shorten URL**:
  - `POST /api/shorten?url=YOUR_URL&algorithm=ALGO`
  - Returns JSON with `id`, `originalUrl`, etc.
- **Redirect**:
  - `GET /{id}`
  - Redirects to the original URL.
