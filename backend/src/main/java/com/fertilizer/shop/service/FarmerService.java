package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.FarmerCreateResponse;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FarmerService {
    private final FarmerRepository farmerRepository;
    private final CreditVoucherRepository creditVoucherRepository;
    private final SettlementRepository settlementRepository;
    private final InterestRecordRepository interestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Farmer> listFarmers(String query) {
        if (query == null || query.isBlank()) {
            return farmerRepository.findAll();
        }
        return farmerRepository.findByNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrVillageContainingIgnoreCase(query, query, query);
    }

    public Optional<Farmer> getFarmerById(Long id) {
        return farmerRepository.findById(id);
    }

   
    @Transactional
    public FarmerCreateResponse createFarmerWithCredentials(Farmer farmer) {
        Farmer saved = farmerRepository.save(farmer);

        String plainPassword = farmer.getPhone();
        boolean userAlreadyExists = userRepository.findByUsername(farmer.getPhone()).isPresent();
        if (!userAlreadyExists) {
            User user = new User();
            user.setUsername(farmer.getPhone());
            user.setPassword(passwordEncoder.encode(plainPassword));
            user.setRole(Role.ROLE_USER);
            userRepository.save(user);
        }

        FarmerCreateResponse response = new FarmerCreateResponse();
        response.setId(saved.getId());
        response.setName(saved.getName());
        response.setPhone(saved.getPhone());
        response.setVillage(saved.getVillage());
        response.setLandAcres(saved.getLandAcres() != null ? saved.getLandAcres().doubleValue() : null);
        response.setLoginUsername(farmer.getPhone());
        response.setLoginPassword(userAlreadyExists ? "(account already existed)" : plainPassword);
        return response;
    }

    public Farmer updateFarmer(Long id, Farmer farmer) {
        farmer.setId(id);
        return farmerRepository.save(farmer);
    }

    public void deleteFarmer(Long id) {
        Farmer farmer = farmerRepository.findById(id).orElseThrow(() -> new RuntimeException("Farmer not found"));
        // Delete the associated user
        User user = userRepository.findByUsername(farmer.getPhone()).orElse(null);
        if (user != null) {
            userRepository.delete(user);
        }
        try {
            farmerRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Cannot delete farmer. They might have existing transactions/settlements.");
        }
    }

    public List<Map<String, Object>> getTransactionHistory(Long farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId).orElse(null);
        if (farmer == null) {
            return null;
        }


        //It creates an empty list that will hold many transaction records,
       //where each transaction record is represented as key–value data
        List<Map<String, Object>> transactions = new ArrayList<>();

        // Get all credits
        List<CreditVoucher> credits = creditVoucherRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
        for (CreditVoucher cv : credits) {
            for (CreditItem item : cv.getItems()) {
                Map<String, Object> txn = new HashMap<>();
                txn.put("id", cv.getId());
                txn.put("type", "CREDIT");
                txn.put("date", cv.getCreatedAt() != null ? cv.getCreatedAt() : LocalDateTime.now());
                BigDecimal amount = item.getPrice().multiply(item.getQuantity());
                txn.put("amount", amount);

                String desc;
                if (item.getType() == CreditItemType.PRODUCT && item.getProduct() != null) {
                    desc = "Product - " + item.getProduct().getName() + " (" + item.getQuantity() + " " + item.getProduct().getUnit() + "s)";
                } else if (item.getType() == CreditItemType.CASH) {
                    desc = "Cash Advance";
                } else {
                    desc = item.getType() + " - " + item.getQuantity() + " units";
                }
                txn.put("description", desc);
                txn.put("status", "COMPLETED");
                transactions.add(txn);
            }
        }

        // Get all settlements
        List<Settlement> settlements = settlementRepository.findByFarmerIdOrderBySettlementDateDesc(farmerId);
        for (Settlement s : settlements) {
            Map<String, Object> txn = new HashMap<>();
            txn.put("id", s.getId());
            txn.put("type", "SETTLEMENT");
            txn.put("date", s.getSettlementDate() != null ? s.getSettlementDate().atStartOfDay() : LocalDateTime.now());
            txn.put("amount", s.getCreditDeducted());
            String cropName = s.getCropPurchase() != null ? s.getCropPurchase().getCropName() : "Crop";
            BigDecimal cropValue = s.getCropPurchase() != null ? s.getCropPurchase().getTotalValue() : BigDecimal.ZERO;
            txn.put("description", "Settlement - " + cropName + " (Crop Value: ₹" + cropValue.toPlainString() + ", Payout: ₹" + s.getNetPayout().toPlainString() + ")");
            txn.put("creditDeducted", s.getCreditDeducted());
            txn.put("interestDeducted", s.getInterestDeducted());
            txn.put("netPayout", s.getNetPayout());
            txn.put("remainingBalance", s.getRemainingBalance());
            txn.put("settlementNo", s.getSettlementNo());
            txn.put("status", "COMPLETED");
            transactions.add(txn);
        }

        // Get all interest records
        List<InterestRecord> interests = interestRepository.findByFarmerIdOrderByCalculatedDateDesc(farmerId);
        for (InterestRecord ir : interests) {
            Map<String, Object> txn = new HashMap<>();
            txn.put("id", ir.getId());
            txn.put("type", "INTEREST");
            txn.put("date", ir.getCalculatedDate() != null ? ir.getCalculatedDate().atStartOfDay() : LocalDateTime.now());
            txn.put("amount", ir.getInterestAmount());
            String rateDesc = ir.getMonthlyRate() != null ? ir.getMonthlyRate().toPlainString() + "%" : "0%";
            txn.put("description", "Interest @ " + rateDesc);
            txn.put("status", "COMPLETED");
            transactions.add(txn);
        }

        // Sort by date descending
        transactions.sort((a, b) -> {
            LocalDateTime dateA = (LocalDateTime) a.get("date");
            LocalDateTime dateB = (LocalDateTime) b.get("date");
            return dateB.compareTo(dateA);
        });

        return transactions;
    }
}
