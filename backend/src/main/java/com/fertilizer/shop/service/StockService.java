package com.fertilizer.shop.service;

import com.fertilizer.shop.model.Stock;
import com.fertilizer.shop.model.StockMovement;
import com.fertilizer.shop.repository.StockMovementRepository;
import com.fertilizer.shop.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository stockRepository;
    private final StockMovementRepository movementRepository;

    public List<Stock> listAll() {
        return stockRepository.findAll();
    }

    public List<StockMovement> getMovements() {
        return movementRepository.findAll();
    }

    @Transactional
    public Stock addStock(Long stockId, BigDecimal quantity) {
        Stock stock = stockRepository.findById(stockId).orElseThrow();
        stock.setQuantity(stock.getQuantity().add(quantity));

        movementRepository.save(StockMovement.builder()
                .product(stock.getProduct())
                .movementType("IN")
                .quantity(quantity)
                .note("Manual stock in")
                .movedAt(LocalDateTime.now())
                .build());

        return stockRepository.save(stock);
    }
}
