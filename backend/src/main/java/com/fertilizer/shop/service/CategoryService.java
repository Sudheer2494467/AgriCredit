package com.fertilizer.shop.service;

import com.fertilizer.shop.model.ProductCategory;
import com.fertilizer.shop.repository.ProductCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final ProductCategoryRepository categoryRepository;

    public List<ProductCategory> listAll() {
        return categoryRepository.findAll();
    }

    public ProductCategory create(ProductCategory category) {
        return categoryRepository.save(category);
    }
    
}
