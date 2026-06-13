package com.fertilizer.shop.service;

import com.fertilizer.shop.repository.FarmerRepository;
import com.fertilizer.shop.repository.SettlementRepository;
import com.fertilizer.shop.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import com.fertilizer.shop.repository.CreditVoucherRepository;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final FarmerRepository farmerRepository;
    private final StockRepository stockRepository;
    private final SettlementRepository settlementRepository;
    private final CreditVoucherRepository creditVoucherRepository;




    //“I used BigDecimal because my project deals with financial and quantity calculations like credit amounts, stock values, and settlements. BigDecimal provides precise arithmetic and avoids rounding errors, which are common with floating-point types like double or float. This ensures accuracy and data integrity in financial calculations.”


    public Map<String, Object> getDashboardData() {
        Map<String, Object> out = new HashMap<>();
        out.put("totalFarmers", farmerRepository.count());

        BigDecimal outstanding = farmerRepository.findAll().stream()
                .map(f -> f.getCurrentBalance() == null ? BigDecimal.ZERO : f.getCurrentBalance())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        out.put("totalOutstandingCredit", outstanding);

        BigDecimal stockValue = stockRepository.findAll().stream()
                .map(s -> s.getQuantity().multiply(s.getProduct().getPricePerUnit()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        out.put("totalStockValue", stockValue);

        // Farmers with Balance > 5000
        List<Map<String, Object>> overdueFarmers = farmerRepository.findAll().stream()
                .filter(f -> f.getCurrentBalance() != null && f.getCurrentBalance().compareTo(new BigDecimal("5000")) > 0)
                .map(f -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", f.getId());
                    m.put("name", f.getName());
                    m.put("phone", f.getPhone());
                    m.put("balance", f.getCurrentBalance());
                    return m;
                })
                .sorted((a, b) -> ((BigDecimal)b.get("balance")).compareTo((BigDecimal)a.get("balance")))
                .limit(5)
                .collect(Collectors.toList());
        out.put("overdueFarmers", overdueFarmers);

        // 2. Low Stock Alerts (Qty < 20)
        List<Map<String, Object>> lowStock = stockRepository.findAll().stream()
                .filter(s -> s.getQuantity() != null && s.getQuantity().compareTo(new BigDecimal("20")) < 0)
                .map(s -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("productName", s.getProduct().getName());
                    m.put("quantity", s.getQuantity());
                    m.put("unit", s.getProduct().getUnit());
                    return m;
                })
                .sorted((a, b) -> ((BigDecimal)a.get("quantity")).compareTo((BigDecimal)b.get("quantity")))
                .limit(5)
                .collect(Collectors.toList());
        out.put("lowStockAlerts", lowStock);

        // 3. Recent Credits
        List<Map<String, Object>> recentCredits = creditVoucherRepository.findAll().stream()
                .sorted(Comparator.comparing(com.fertilizer.shop.model.CreditVoucher::getCreatedAt).reversed())
                .limit(5)
                .map(cv -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", cv.getId());
                    m.put("farmerName", cv.getFarmer().getName());
                    m.put("amount", cv.getTotalCreditAmount());
                    m.put("date", cv.getCreatedAt());
                    m.put("type", "CREDIT");
                    return m;
                })
                .collect(Collectors.toList());
        out.put("recentCredits", recentCredits);

        // 4. Recent Settlements
        List<Map<String, Object>> recentSettlements = settlementRepository.findAll().stream()
                .sorted(Comparator.comparing(com.fertilizer.shop.model.Settlement::getSettlementDate).reversed())
                .limit(5)
                .map(s -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", s.getId());
                    m.put("farmerName", s.getFarmer().getName());
                    m.put("amount", s.getNetPayout());
                    m.put("date", s.getSettlementDate());
                    m.put("type", "SETTLEMENT");
                    return m;
                })
                .collect(Collectors.toList());
        out.put("recentSettlements", recentSettlements);

        return out;
    }
}
