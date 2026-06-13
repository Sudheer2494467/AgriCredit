package com.fertilizer.shop.controller;

import com.fertilizer.shop.dto.FarmerCreateResponse;
import com.fertilizer.shop.model.Farmer;
import com.fertilizer.shop.service.FarmerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/farmers")
@RequiredArgsConstructor
public class FarmerController {
    private final FarmerService farmerService;

    @GetMapping
    public List<Farmer> list(@RequestParam(required = false) String q) {
        return farmerService.listFarmers(q);
    }
     
  

    @GetMapping("/{id}")
    public ResponseEntity<Farmer> getFarmer(@PathVariable Long id) {
        return farmerService.getFarmerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    @PostMapping
    public ResponseEntity<FarmerCreateResponse> create(@RequestBody Farmer farmer) {
        return ResponseEntity.ok(farmerService.createFarmerWithCredentials(farmer));
    }

    @PutMapping("/{id}")
    public Farmer update(@PathVariable Long id, @RequestBody Farmer farmer) {
        return farmerService.updateFarmer(id, farmer);
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        farmerService.deleteFarmer(id);
    }

    @GetMapping("/{farmerId}/transactions")
    public ResponseEntity<List<Map<String, Object>>> getTransactionHistory(@PathVariable Long farmerId) {
        List<Map<String, Object>> transactions = farmerService.getTransactionHistory(farmerId);
        if (transactions == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(transactions);
    }
}
