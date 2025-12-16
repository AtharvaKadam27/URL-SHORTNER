package com.example.urlshortener.service;

import com.google.common.hash.Hashing;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.zip.Adler32;
import java.util.zip.CRC32;

@Service
public class HashingService {

    public String shorten(String url, String algorithm) {
        switch (algorithm.toUpperCase()) {
            case "MD5":
                return Hashing.md5().hashString(url, StandardCharsets.UTF_8).toString().substring(0, 8);
            case "SHA256":
                return Hashing.sha256().hashString(url, StandardCharsets.UTF_8).toString().substring(0, 10);
            case "CRC32":
                CRC32 crc32 = new CRC32();
                crc32.update(url.getBytes(StandardCharsets.UTF_8));
                return Long.toHexString(crc32.getValue());
            case "ADLER32":
                Adler32 adler32 = new Adler32();
                adler32.update(url.getBytes(StandardCharsets.UTF_8));
                return Long.toHexString(adler32.getValue());
            case "BASE62":
                // Simple random Base62-like implementation using UUID
                return generateBase62();
            default:
                // Default to CRC32 if unknown
                CRC32 def = new CRC32();
                def.update(url.getBytes(StandardCharsets.UTF_8));
                return Long.toHexString(def.getValue());
        }
    }

    private String generateBase62() {
        String uuid = UUID.randomUUID().toString().replaceAll("-", "");
        return uuid.substring(0, 8); // simplified random short string
    }
}
