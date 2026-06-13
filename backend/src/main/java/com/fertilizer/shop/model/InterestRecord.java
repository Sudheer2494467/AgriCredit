package com.fertilizer.shop.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "interest_records")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterestRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Farmer farmer;
    private BigDecimal principal;
    private BigDecimal monthlyRate;
    private Integer months;
    private BigDecimal interestAmount;
    private LocalDate calculatedDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Farmer getFarmer() { return farmer; }
    public void setFarmer(Farmer farmer) { this.farmer = farmer; }
    public BigDecimal getPrincipal() { return principal; }
    public void setPrincipal(BigDecimal principal) { this.principal = principal; }
    public BigDecimal getMonthlyRate() { return monthlyRate; }
    public void setMonthlyRate(BigDecimal monthlyRate) { this.monthlyRate = monthlyRate; }
    public Integer getMonths() { return months; }
    public void setMonths(Integer months) { this.months = months; }
    public BigDecimal getInterestAmount() { return interestAmount; }
    public void setInterestAmount(BigDecimal interestAmount) { this.interestAmount = interestAmount; }
    public LocalDate getCalculatedDate() { return calculatedDate; }
    public void setCalculatedDate(LocalDate calculatedDate) { this.calculatedDate = calculatedDate; }

    public static InterestRecordBuilder builder() {
        return new InterestRecordBuilder();
    }
    
    public static class InterestRecordBuilder {
        private Long id;
        private Farmer farmer;
        private BigDecimal principal;
        private BigDecimal monthlyRate;
        private Integer months;
        private BigDecimal interestAmount;
        private LocalDate calculatedDate;
        
        public InterestRecordBuilder id(Long id) { this.id = id; return this; }
        public InterestRecordBuilder farmer(Farmer farmer) { this.farmer = farmer; return this; }
        public InterestRecordBuilder principal(BigDecimal principal) { this.principal = principal; return this; }
        public InterestRecordBuilder monthlyRate(BigDecimal monthlyRate) { this.monthlyRate = monthlyRate; return this; }
        public InterestRecordBuilder months(Integer months) { this.months = months; return this; }
        public InterestRecordBuilder interestAmount(BigDecimal interestAmount) { this.interestAmount = interestAmount; return this; }
        public InterestRecordBuilder calculatedDate(LocalDate calculatedDate) { this.calculatedDate = calculatedDate; return this; }
        
        public InterestRecord build() {
            return new InterestRecord(id, farmer, principal, monthlyRate, months, interestAmount, calculatedDate);
        }
    }
}
