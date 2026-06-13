package com.fertilizer.shop.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "crop_purchases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CropPurchase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Farmer farmer;
    private String cropName;
    private BigDecimal quantity;
    private BigDecimal pricePerKg;
    private BigDecimal totalValue;
    private LocalDate purchaseDate;
}
