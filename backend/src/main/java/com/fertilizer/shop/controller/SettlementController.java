package com.fertilizer.shop.controller;

import com.fertilizer.shop.dto.SettlementRequest;
import com.fertilizer.shop.model.Settlement;
import com.fertilizer.shop.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/settlement")
@RequiredArgsConstructor
public class SettlementController {
    private final SettlementService settlementService;

    @PostMapping
    public Settlement create(@RequestBody SettlementRequest request) {
        return settlementService.createSettlement(request);
    }

    @GetMapping("/farmer/{farmerId}")
    public List<Settlement> byFarmer(@PathVariable Long farmerId) {
        return settlementService.getByFarmer(farmerId);
    }
}
