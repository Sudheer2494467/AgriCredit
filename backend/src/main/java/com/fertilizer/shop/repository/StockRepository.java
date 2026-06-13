package com.fertilizer.shop.repository;

import com.fertilizer.shop.model.Product;
import com.fertilizer.shop.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByProduct(Product product);
}
