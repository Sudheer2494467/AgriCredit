package com.fertilizer.shop.repository;

import com.fertilizer.shop.model.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    Optional<MarketPrice> findByCropNameIgnoreCase(String cropName);
}
