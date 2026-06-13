package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.InterestRequest;
import com.fertilizer.shop.model.Farmer;
import com.fertilizer.shop.model.InterestRecord;
import com.fertilizer.shop.repository.FarmerRepository;
import com.fertilizer.shop.repository.InterestRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterestService {
    private final InterestRecordRepository repository;
    private final FarmerRepository farmerRepository;

    @Value("${app.interest.monthly-rate}")
    private BigDecimal monthlyRate;

    public InterestRecord calculateInterest(InterestRequest req) {
        Farmer farmer = farmerRepository.findById(req.getFarmerId()).orElseThrow();
        BigDecimal principal = req.getPrincipal() != null ? req.getPrincipal() : farmer.getCurrentBalance();
        int months = req.getMonths() == null ? 1 : req.getMonths();
        BigDecimal interest = principal.multiply(monthlyRate).multiply(BigDecimal.valueOf(months)).divide(BigDecimal.valueOf(100));

        return repository.save(InterestRecord.builder()
                .farmer(farmer)
                .principal(principal)
                .monthlyRate(monthlyRate)
                .months(months)
                .interestAmount(interest)
                .calculatedDate(LocalDate.now())
                .build());
    }

    public List<InterestRecord> getByFarmer(Long farmerId) {
        return repository.findByFarmerIdOrderByCalculatedDateDesc(farmerId);
    }
}
