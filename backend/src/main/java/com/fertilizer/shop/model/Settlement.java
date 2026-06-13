package com.fertilizer.shop.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "settlements")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Settlement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String settlementNo;
    @ManyToOne(optional = false)
    private Farmer farmer;
    @OneToOne(cascade = CascadeType.ALL)
    private CropPurchase cropPurchase;
    private BigDecimal creditDeducted;
    private BigDecimal interestDeducted;
    private BigDecimal netPayout;
    private BigDecimal remainingBalance; // If crop value < debt, farmer still owes this amount
    private LocalDate settlementDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSettlementNo() { return settlementNo; }
    public void setSettlementNo(String settlementNo) { this.settlementNo = settlementNo; }
    public Farmer getFarmer() { return farmer; }
    public void setFarmer(Farmer farmer) { this.farmer = farmer; }
    public CropPurchase getCropPurchase() { return cropPurchase; }
    public void setCropPurchase(CropPurchase cropPurchase) { this.cropPurchase = cropPurchase; }
    public BigDecimal getCreditDeducted() { return creditDeducted; }
    public void setCreditDeducted(BigDecimal creditDeducted) { this.creditDeducted = creditDeducted; }
    public BigDecimal getInterestDeducted() { return interestDeducted; }
    public void setInterestDeducted(BigDecimal interestDeducted) { this.interestDeducted = interestDeducted; }
    public BigDecimal getNetPayout() { return netPayout; }
    public void setNetPayout(BigDecimal netPayout) { this.netPayout = netPayout; }
    public BigDecimal getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(BigDecimal remainingBalance) { this.remainingBalance = remainingBalance; }
    public LocalDate getSettlementDate() { return settlementDate; }
    public void setSettlementDate(LocalDate settlementDate) { this.settlementDate = settlementDate; }
}
