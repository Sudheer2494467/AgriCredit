package com.fertilizer.shop.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class InterestRequest {
    private Long farmerId;
    private Integer months;
    private BigDecimal principal;
}
