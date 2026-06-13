package com.fertilizer.shop.repository;

import com.fertilizer.shop.model.CreditVoucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditVoucherRepository extends JpaRepository<CreditVoucher, Long> {
    List<CreditVoucher> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<CreditVoucher> findByFarmerIdAndIsSettledFalse(Long farmerId);
    List<CreditVoucher> findByFarmerIdAndStatus(Long farmerId, com.fertilizer.shop.model.VoucherStatus status);
}
