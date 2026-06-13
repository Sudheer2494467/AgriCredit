package com.fertilizer.shop.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "credit_vouchers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreditVoucher {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String voucherNo;
    @ManyToOne(optional = false)
    private Farmer farmer;
    private BigDecimal totalProductAmount;
    private BigDecimal totalCashAmount;
    private BigDecimal totalCreditAmount;
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean isSettled = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VoucherStatus status = VoucherStatus.CONFIRMED;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CreditItem> items = new ArrayList<>();
    
    public boolean isSettled() { return isSettled; }
    public void setSettled(boolean settled) { isSettled = settled; }
    public VoucherStatus getStatus() { return status; }
    public void setStatus(VoucherStatus status) { this.status = status; }
}
