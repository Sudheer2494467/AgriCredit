package com.fertilizer.shop.controller;

import com.fertilizer.shop.dto.CreditVoucherRequest;
import com.fertilizer.shop.model.CreditVoucher;
import com.fertilizer.shop.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/credit")
@RequiredArgsConstructor
public class CreditController {
    private final CreditService creditService;

    @PostMapping
    public CreditVoucher create(@RequestBody CreditVoucherRequest request) {
        return creditService.createVoucher(request);
    }

    @GetMapping("/farmer/{farmerId}")
    public List<CreditVoucher> byFarmer(@PathVariable Long farmerId) {
        return creditService.getByFarmer(farmerId);
    }

    @GetMapping("/farmer/{farmerId}/pending")
    public List<CreditVoucher> pendingByFarmer(@PathVariable Long farmerId) {
        return creditService.getPendingByFarmer(farmerId);
    }

    @PutMapping("/{id}/approve")
    public CreditVoucher approve(@PathVariable Long id) {
        return creditService.approveVoucher(id);
    }
}
