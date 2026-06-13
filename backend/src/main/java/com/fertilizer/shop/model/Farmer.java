package com.fertilizer.shop.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "farmers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Farmer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String phone;
    private String village;
    private BigDecimal landAcres;
    @Column(nullable = false)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    // Manual implementations for compatibility
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getVillage() { return village; }
    public void setVillage(String village) { this.village = village; }
    public BigDecimal getLandAcres() { return landAcres; }
    public void setLandAcres(BigDecimal landAcres) { this.landAcres = landAcres; }
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }
}
