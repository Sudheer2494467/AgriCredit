package com.fertilizer.shop.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "store_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreSettings {
    @Id
    private Long id; // We will use a fixed ID of 1 for the single settings row

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal productInterestRate = new BigDecimal("2.0");

    @Column(nullable = false)
    @Builder.Default
    private BigDecimal cashInterestRate = new BigDecimal("2.0");

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public BigDecimal getProductInterestRate() { return productInterestRate; }
    public void setProductInterestRate(BigDecimal productInterestRate) { this.productInterestRate = productInterestRate; }
    public BigDecimal getCashInterestRate() { return cashInterestRate; }
    public void setCashInterestRate(BigDecimal cashInterestRate) { this.cashInterestRate = cashInterestRate; }
}
