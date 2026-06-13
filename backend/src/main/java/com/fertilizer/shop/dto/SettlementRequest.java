package com.fertilizer.shop.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class SettlementRequest {
    private Long farmerId;
    private String cropName;
    private BigDecimal quantity;
    private BigDecimal pricePerKg;
    private Integer interestMonths;
}
