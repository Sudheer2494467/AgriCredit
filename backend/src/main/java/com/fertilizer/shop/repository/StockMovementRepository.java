package com.fertilizer.shop.repository;

import com.fertilizer.shop.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {}
