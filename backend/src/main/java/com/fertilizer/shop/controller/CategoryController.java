package com.fertilizer.shop.controller;

import com.fertilizer.shop.model.ProductCategory;
import com.fertilizer.shop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public List<ProductCategory> list() {
        return categoryService.listAll();
    }

    @PostMapping
    public ProductCategory create(@RequestBody ProductCategory category) {
        return categoryService.create(category);
    }
}
