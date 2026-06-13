package com.fertilizer.shop.dto;

import com.fertilizer.shop.model.CreditItemType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CreditItemRequest {
    private CreditItemType type;
    private Long categoryId;
    private Long productId;
    private BigDecimal quantity;
    private BigDecimal price;
}
