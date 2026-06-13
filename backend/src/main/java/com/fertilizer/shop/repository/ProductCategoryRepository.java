package com.fertilizer.shop.repository;

import com.fertilizer.shop.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {}
