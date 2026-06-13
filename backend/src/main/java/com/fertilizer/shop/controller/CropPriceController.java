package com.fertilizer.shop.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/crop-prices")
@RequiredArgsConstructor
public class CropPriceController {

    // In-memory TTL cache: 5-minute validity
    private static final long CACHE_TTL_MS = 5 * 60 * 1000;
    private final Map<String, Object> cache = new ConcurrentHashMap<>();
    private long cacheTimestamp = 0L;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCropPrices() {
        long now = System.currentTimeMillis();
        if (!cache.isEmpty() && (now - cacheTimestamp) < CACHE_TTL_MS) {
            return ResponseEntity.ok(Map.copyOf(cache));
        }

        // Build demo/realistic price data for Indian mandi market
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("source", "demo");
        response.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm")));
        response.put("prices", buildDemoPrices());

        cache.clear();
        cache.putAll(response);
        cacheTimestamp = now;

        return ResponseEntity.ok(response);
    }

    private List<Map<String, Object>> buildDemoPrices() {
        List<Map<String, Object>> prices = new ArrayList<>();

        // Paddy (Rice) — typical MSP range ₹2183/quintal (2024-25 MSP is ₹2300/q)
        Map<String, Object> paddy = new LinkedHashMap<>();
        paddy.put("crop", "Paddy");
        paddy.put("cropTelugu", "వరి");
        paddy.put("unit", "₹/Quintal");
        paddy.put("price", 2300);
        paddy.put("minPrice", 2150);
        paddy.put("maxPrice", 2450);
        paddy.put("modalPrice", 2300);
        paddy.put("trend", "up");
        paddy.put("change", "+1.2%");
        paddy.put("market", "Nizamabad");
        paddy.put("color", "#D4AF37"); // Earthy golden yellow
        prices.add(paddy);

        // Cotton — typical ₹6500–7000/quintal
        Map<String, Object> cotton = new LinkedHashMap<>();
        cotton.put("crop", "Cotton");
        cotton.put("cropTelugu", "పత్తి");
        cotton.put("unit", "₹/Quintal");
        cotton.put("price", 6800);
        cotton.put("minPrice", 6500);
        cotton.put("maxPrice", 7200);
        cotton.put("modalPrice", 6800);
        cotton.put("trend", "down");
        cotton.put("change", "-0.8%");
        cotton.put("market", "Warangal");
        cotton.put("color", "#788B9C"); // Deep earthy blue-grey for better contrast than light grey
        prices.add(cotton);

        // Mirchi (Chilli) — typical ₹8000–15000/quintal
        Map<String, Object> mirchi = new LinkedHashMap<>();
        mirchi.put("crop", "Mirchi");
        mirchi.put("cropTelugu", "మిర్చి");
        mirchi.put("unit", "₹/Quintal");
        mirchi.put("price", 11500);
        mirchi.put("minPrice", 9500);
        mirchi.put("maxPrice", 14000);
        mirchi.put("modalPrice", 11500);
        mirchi.put("trend", "up");
        mirchi.put("change", "+3.5%");
        mirchi.put("market", "Guntur");
        mirchi.put("color", "#A52A2A"); // Earthy Auburn Red
        prices.add(mirchi);

        return prices;
    }
}
