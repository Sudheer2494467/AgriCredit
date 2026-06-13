package com.fertilizer.shop.controller;

import com.fertilizer.shop.model.MarketPrice;
import com.fertilizer.shop.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/market-prices")
@RequiredArgsConstructor
public class MarketPriceController {

    private final MarketPriceRepository marketPriceRepository;

    /** Seed initial data if table is empty */
    @PostConstruct
    public void seedInitialPrices() {
        if (marketPriceRepository.count() > 0) return;

        List<MarketPrice> defaults = List.of(
            build("Paddy",       "వరి",       "₹/Quintal", 2300, 2150, 2450, "up",     "+1.2%", "Nizamabad", "#2e7d32"),
            build("Cotton",      "పత్తి",      "₹/Quintal", 6800, 6500, 7200, "down",   "-0.8%", "Warangal",  "#795548"),
            build("Mirchi",      "మిర్చి",     "₹/Quintal",11500, 9500,14000, "up",     "+3.5%", "Guntur",    "#c62828"),
            build("Maize",       "మొక్కజొన్న","₹/Quintal", 1940, 1800, 2100, "stable", "0.0%",  "Nizamabad", "#f9a825"),
            build("Groundnut",   "వేరుశనగ",   "₹/Quintal", 5800, 5500, 6200, "up",     "+0.9%", "Kurnool",   "#bf8040")
        );
        marketPriceRepository.saveAll(defaults);
    }

    private MarketPrice build(String crop, String telugu, String unit,
                               int price, int min, int max,
                               String trend, String change, String market, String color) {
        MarketPrice mp = new MarketPrice();
        mp.setCropName(crop);
        mp.setCropNameTelugu(telugu);
        mp.setUnit(unit);
        mp.setPrice(BigDecimal.valueOf(price));
        mp.setMinPrice(BigDecimal.valueOf(min));
        mp.setMaxPrice(BigDecimal.valueOf(max));
        mp.setTrend(trend);
        mp.setChangePercent(change);
        mp.setMarket(market);
        mp.setColorHex(color);
        mp.setLastUpdatedBy("system");
        mp.setLastUpdatedAt(LocalDateTime.now());
        return mp;
    }

    /** GET /api/market-prices — accessible to ADMIN and FARMER */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPrices() {
        List<MarketPrice> prices = marketPriceRepository.findAll();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("source", "database");
        response.put("lastUpdated", prices.stream()
                .map(MarketPrice::getLastUpdatedAt)
                .max(LocalDateTime::compareTo)
                .map(LocalDateTime::toString)
                .orElse("N/A"));
        response.put("prices", prices.stream().map(this::toMap).toList());
        return ResponseEntity.ok(response);
    }

    /** POST /api/market-prices — ADMIN only: add new crop price */
    @PostMapping
    public ResponseEntity<MarketPrice> create(@RequestBody MarketPrice mp,
                                               Authentication auth) {
        mp.setLastUpdatedBy(auth.getName());
        mp.setLastUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(marketPriceRepository.save(mp));
    }

    /** PUT /api/market-prices/{id} — ADMIN only: update a crop price */
    @PutMapping("/{id}")
    public ResponseEntity<MarketPrice> update(@PathVariable Long id,
                                               @RequestBody MarketPrice mp,
                                               Authentication auth) {
        MarketPrice existing = marketPriceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Market price not found: " + id));
        existing.setPrice(mp.getPrice());
        existing.setMinPrice(mp.getMinPrice());
        existing.setMaxPrice(mp.getMaxPrice());
        existing.setTrend(mp.getTrend());
        existing.setChangePercent(mp.getChangePercent());
        existing.setMarket(mp.getMarket());
        if (mp.getCropNameTelugu() != null) existing.setCropNameTelugu(mp.getCropNameTelugu());
        existing.setLastUpdatedBy(auth.getName());
        existing.setLastUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(marketPriceRepository.save(existing));
    }

    /** DELETE /api/market-prices/{id} — ADMIN only */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        marketPriceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(MarketPrice mp) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", mp.getId());
        m.put("crop", mp.getCropName());
        m.put("cropTelugu", mp.getCropNameTelugu());
        m.put("unit", mp.getUnit());
        m.put("price", mp.getPrice());
        m.put("minPrice", mp.getMinPrice());
        m.put("maxPrice", mp.getMaxPrice());
        m.put("trend", mp.getTrend());
        m.put("change", mp.getChangePercent());
        m.put("market", mp.getMarket());
        m.put("color", mp.getColorHex());
        m.put("lastUpdatedBy", mp.getLastUpdatedBy());
        m.put("lastUpdatedAt", mp.getLastUpdatedAt());
        return m;
    }
}
