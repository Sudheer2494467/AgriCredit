package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.SettlementRequest;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.CreditVoucherRepository;
import com.fertilizer.shop.repository.FarmerRepository;
import com.fertilizer.shop.repository.InterestRecordRepository;
import com.fertilizer.shop.repository.SettlementRepository;
import com.fertilizer.shop.repository.StoreSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SettlementService {
    private final FarmerRepository farmerRepository;
    private final InterestRecordRepository interestRecordRepository;
    private final SettlementRepository settlementRepository;
    private final CreditVoucherRepository creditVoucherRepository;
    private final StoreSettingsRepository storeSettingsRepository;

    @Transactional
    public Settlement createSettlement(SettlementRequest request) {
        Farmer farmer = farmerRepository.findById(request.getFarmerId()).orElseThrow();
        BigDecimal cropValue = request.getQuantity().multiply(request.getPricePerKg());

        // Get store settings for interest rates
        StoreSettings settings = storeSettingsRepository.findById(1L).orElseGet(() -> StoreSettings.builder()
                .id(1L)
                .productInterestRate(new BigDecimal("2.0"))
                .cashInterestRate(new BigDecimal("2.0"))
                .build());

        // Fetch unsettled vouchers (only CONFIRMED ones, not PENDING_APPROVAL)
        List<CreditVoucher> unsettledVouchers = creditVoucherRepository.findByFarmerIdAndIsSettledFalse(farmer.getId());
        unsettledVouchers = unsettledVouchers.stream()
                .filter(v -> v.getStatus() == VoucherStatus.CONFIRMED)
                .collect(java.util.stream.Collectors.toList());

        BigDecimal totalInterest = BigDecimal.ZERO;
        LocalDate now = LocalDate.now();

        // Calculate interest item by item
        for (CreditVoucher voucher : unsettledVouchers) {
            long monthsElapsed = ChronoUnit.MONTHS.between(voucher.getCreatedAt().toLocalDate(), now);
            if (monthsElapsed < 1) {
                monthsElapsed = 1; // Minimum 1 month interest
            }

            for (CreditItem item : voucher.getItems()) {
                BigDecimal rate = item.getType() == CreditItemType.PRODUCT 
                        ? settings.getProductInterestRate() 
                        : settings.getCashInterestRate();
                
                BigDecimal itemInterest = item.getTotal()
                        .multiply(rate)
                        .multiply(BigDecimal.valueOf(monthsElapsed))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                        
                totalInterest = totalInterest.add(itemInterest);
            }
            
            // Mark voucher as settled
            voucher.setSettled(true);
            voucher.setStatus(VoucherStatus.SETTLED);
            creditVoucherRepository.save(voucher);
        }

        // If for some reason there were no unsettled vouchers but farmer has a balance (e.g. legacy data),
        // we might still want to apply interest. But let's trust the item-wise calc.
        
        // Save interest record for audit
        InterestRecord record = InterestRecord.builder()
                .farmer(farmer)
                .principal(farmer.getCurrentBalance())
                .monthlyRate(settings.getProductInterestRate()) // Legacy field, storing product rate
                .months((int) 1) // Legacy field
                .interestAmount(totalInterest)
                .calculatedDate(now)
                .build();
        interestRecordRepository.save(record);

        CropPurchase purchase = CropPurchase.builder()
                .farmer(farmer)
                .cropName(request.getCropName())
                .quantity(request.getQuantity())
                .pricePerKg(request.getPricePerKg())
                .totalValue(cropValue)
                .purchaseDate(now)
                .build();

        // Calculate total debt
        BigDecimal originalBalance = farmer.getCurrentBalance();
        BigDecimal totalDebt = originalBalance.add(totalInterest);

        // Handle case where crop value is less than total debt
        BigDecimal netPayout;
        BigDecimal remainingBalance;
        BigDecimal creditDeductedAmount;
        
        if (cropValue.compareTo(totalDebt) >= 0) {
            // Crop value covers all debt
            netPayout = cropValue.subtract(totalDebt);
            remainingBalance = BigDecimal.ZERO;
            creditDeductedAmount = originalBalance;
            farmer.setCurrentBalance(BigDecimal.ZERO);
        } else {
            // Crop value is less than debt - farmer still owes
            netPayout = BigDecimal.ZERO;
            remainingBalance = totalDebt.subtract(cropValue);
            // Credit deducted is at most cropValue minus interest (or full balance if interest < cropValue)
            if (cropValue.compareTo(totalInterest) > 0) {
                creditDeductedAmount = cropValue.subtract(totalInterest);
            } else {
                creditDeductedAmount = BigDecimal.ZERO;
            }
            farmer.setCurrentBalance(remainingBalance);
        }

        Settlement settlement = Settlement.builder()
                .settlementNo("ST-" + System.currentTimeMillis())
                .farmer(farmer)
                .cropPurchase(purchase)
                .creditDeducted(creditDeductedAmount)
                .interestDeducted(totalInterest)
                .netPayout(netPayout)
                .remainingBalance(remainingBalance)
                .settlementDate(now)
                .build();

        farmerRepository.save(farmer);

        return settlementRepository.save(settlement);
    }

    public List<Settlement> getByFarmer(Long farmerId) {
        return settlementRepository.findByFarmerIdOrderBySettlementDateDesc(farmerId);
    }
}
