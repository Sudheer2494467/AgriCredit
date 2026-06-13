package com.fertilizer.shop.controller;

import com.fertilizer.shop.model.Stock;
import com.fertilizer.shop.model.StockMovement;
import com.fertilizer.shop.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockController {
    private final StockService stockService;

    @GetMapping
    public List<Stock> list() {
        return stockService.listAll();
    }

    @GetMapping("/movements")
    public List<StockMovement> movements() {
        return stockService.getMovements();
    }

    @PostMapping("/{stockId}/in")
    public Stock stockIn(@PathVariable Long stockId, @RequestBody Map<String, String> body) {
        BigDecimal qty = new BigDecimal(body.getOrDefault("quantity", "0"));
        return stockService.addStock(stockId, qty);
    }
}
