package com.fertilizer.shop.service;

import com.fertilizer.shop.model.Product;
import com.fertilizer.shop.model.Stock;
import com.fertilizer.shop.repository.ProductRepository;
import com.fertilizer.shop.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;

    public List<Product> listAll() {
        return productRepository.findAll();
    }

    @Transactional
    public Product create(Product product) {
        Product savedProduct = productRepository.save(product);
        stockRepository.save(Stock.builder()
                .product(savedProduct)
                .quantity(BigDecimal.ZERO)
                .build());
        return savedProduct;
    }
}
