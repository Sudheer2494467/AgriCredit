package com.fertilizer.shop.controller;

import com.fertilizer.shop.model.StoreSettings;
import com.fertilizer.shop.repository.StoreSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final StoreSettingsRepository storeSettingsRepository;

    @GetMapping
    public StoreSettings getSettings() {
        return storeSettingsRepository.findById(1L).orElseGet(() -> StoreSettings.builder()
                .id(1L)
                .productInterestRate(new BigDecimal("2.0"))
                .cashInterestRate(new BigDecimal("2.0"))
                .build());
    }

    @PutMapping
    public StoreSettings updateSettings(@RequestBody StoreSettings newSettings) {
        StoreSettings settings = storeSettingsRepository.findById(1L).orElseGet(() -> StoreSettings.builder()
                .id(1L)
                .build());
        
        settings.setProductInterestRate(newSettings.getProductInterestRate());
        settings.setCashInterestRate(newSettings.getCashInterestRate());
        
        return storeSettingsRepository.save(settings);
    }
}
