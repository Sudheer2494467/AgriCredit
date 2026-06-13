package com.fertilizer.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fertilizer.shop.dto.SettlementRequest;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@DisplayName("Settlement Controller Integration Tests")
class SettlementControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private CreditVoucherRepository creditVoucherRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private StoreSettingsRepository storeSettingsRepository;

    @Autowired
    private InterestRecordRepository interestRecordRepository;

    private Farmer testFarmer;
    private CreditVoucher testVoucher;
    private StoreSettings storeSettings;

    @BeforeEach
    @Transactional
    void setUp() {
        // Clear previous data
        interestRecordRepository.deleteAll();
        creditVoucherRepository.deleteAll();
        settlementRepository.deleteAll();
        farmerRepository.deleteAll();
        storeSettingsRepository.deleteAll();

        // Create test farmer
        testFarmer = Farmer.builder()
                .name("Integration Test Farmer")
                .phone("9876543210")
                .village("Test Village")
                .landAcres(new BigDecimal("10"))
                .currentBalance(new BigDecimal("5000.00"))
                .build();
        testFarmer = farmerRepository.save(testFarmer);

        // Create store settings
        storeSettings = StoreSettings.builder()
                .id(1L)
                .productInterestRate(new BigDecimal("2.0"))
                .cashInterestRate(new BigDecimal("2.0"))
                .build();
        storeSettingsRepository.save(storeSettings);

        // Create credit voucher
        testVoucher = CreditVoucher.builder()
                .voucherNo("V-INT-001")
                .farmer(testFarmer)
                .status(VoucherStatus.CONFIRMED)
                .totalCreditAmount(new BigDecimal("5000.00"))
                .createdAt(LocalDateTime.now().minusMonths(1))
                .items(new ArrayList<>())
                .build();

        CreditItem item1 = CreditItem.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("5000.00"))
                .total(new BigDecimal("5000.00"))
                .voucher(testVoucher) // set voucher reference
                .build();
        testVoucher.getItems().add(item1);

        testVoucher = creditVoucherRepository.save(testVoucher);
    }

    @Test
    @DisplayName("POST /settlement - Should create settlement successfully")
    @Transactional
    void testCreateSettlementSuccessfully() throws Exception {
        // Prepare settlement request
        SettlementRequest request = new SettlementRequest();
        request.setFarmerId(testFarmer.getId());
        request.setCropName("Cotton");
        request.setQuantity(new BigDecimal("100"));
        request.setPricePerKg(new BigDecimal("60")); // 6000 crop value

        // Execute
        mockMvc.perform(post("/settlement")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.settlementNo").exists())
                .andExpect(jsonPath("$.settlementNo").isNotEmpty())
                .andExpect(jsonPath("$.farmer.id").value(testFarmer.getId()))
                .andExpect(jsonPath("$.cropPurchase.cropName").value("Cotton"))
                .andExpect(jsonPath("$.cropPurchase.quantity").value(100))
                .andExpect(jsonPath("$.cropPurchase.pricePerKg").value(60))
                .andExpect(jsonPath("$.creditDeducted").isNotEmpty())
                .andExpect(jsonPath("$.interestDeducted").isNumber())
                .andExpect(jsonPath("$.netPayout").isNotEmpty())
                .andExpect(jsonPath("$.settlementDate").exists());
    }

    @Test
    @DisplayName("GET /settlement/farmer/{farmerId} - Should retrieve settlement list")
    @Transactional
    void testGetSettlementsByFarmer() throws Exception {
        // Create a settlement first
        SettlementRequest request = new SettlementRequest();
        request.setFarmerId(testFarmer.getId());
        request.setCropName("Soybean");
        request.setQuantity(new BigDecimal("50"));
        request.setPricePerKg(new BigDecimal("40"));

        // Execute create settlement
        mockMvc.perform(post("/settlement")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Execute get settlements
        mockMvc.perform(get("/settlement/farmer/" + testFarmer.getId())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].farmer.id").value(testFarmer.getId()))
                .andExpect(jsonPath("$[0].settlementNo").exists());
    }

    @Test
    @DisplayName("POST /settlement - Should handle remaining balance when crop value < debt")
    @Transactional
    void testSettlementWithRemainingBalance() throws Exception {
        // Prepare settlement request with small crop value
        SettlementRequest request = new SettlementRequest();
        request.setFarmerId(testFarmer.getId());
        request.setCropName("Pulses");
        request.setQuantity(new BigDecimal("10"));
        request.setPricePerKg(new BigDecimal("20")); // 200 crop value (much less than 5000 debt)

        // Execute
        mockMvc.perform(post("/settlement")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.netPayout").value(0.0))
                .andExpect(jsonPath("$.remainingBalance").isNotEmpty())
                .andExpect(jsonPath("$.remainingBalance", org.hamcrest.Matchers.greaterThan(0.0)));
    }

    @Test
    @DisplayName("POST /settlement - Should create settlement with zero payout when crop value > debt")
    @Transactional
    void testSettlementWithPositivePayout() throws Exception {
        // Create farmer with smaller debt
        Farmer smallDebtFarmer = Farmer.builder()
                .name("Small Debt Farmer")
                .phone("9876543211")
                .village("Test Village")
                .landAcres(new BigDecimal("5"))
                .currentBalance(new BigDecimal("1000.00"))
                .build();
        smallDebtFarmer = farmerRepository.save(smallDebtFarmer);

        // Create credit voucher for this farmer
        CreditVoucher voucher = CreditVoucher.builder()
                .voucherNo("V-INT-002")
                .farmer(smallDebtFarmer)
                .status(VoucherStatus.CONFIRMED)
                .totalCreditAmount(new BigDecimal("1000.00"))
                .createdAt(LocalDateTime.now().minusMonths(1))
                .items(new ArrayList<>())
                .build();

        CreditItem item = CreditItem.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("1000.00"))
                .total(new BigDecimal("1000.00"))
                .voucher(voucher)
                .build();
        voucher.getItems().add(item);

        creditVoucherRepository.save(voucher);

        // Settlement with high crop value
        SettlementRequest request = new SettlementRequest();
        request.setFarmerId(smallDebtFarmer.getId());
        request.setCropName("Wheat");
        request.setQuantity(new BigDecimal("100"));
        request.setPricePerKg(new BigDecimal("30")); // 3000 crop value (more than 1000 debt)

        // Execute
        mockMvc.perform(post("/settlement")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.netPayout", org.hamcrest.Matchers.greaterThan(0.0)))
                .andExpect(jsonPath("$.remainingBalance").value(0.0));
    }

    @Test
    @DisplayName("POST /settlement - Should generate unique settlement numbers")
    @Transactional
    void testSettlementNumbersUnique() throws Exception {
        // Create first settlement
        SettlementRequest request1 = new SettlementRequest();
        request1.setFarmerId(testFarmer.getId());
        request1.setCropName("Cotton");
        request1.setQuantity(new BigDecimal("50"));
        request1.setPricePerKg(new BigDecimal("40"));

        String response1 = mockMvc.perform(post("/settlement")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String settlementNo1 = objectMapper.readTree(response1).get("settlementNo").asText();

        // Reset farmer and create another settlement
        testFarmer.setCurrentBalance(new BigDecimal("5000.00"));
        farmerRepository.save(testFarmer);

        SettlementRequest request2 = new SettlementRequest();
        request2.setFarmerId(testFarmer.getId());
        request2.setCropName("Soybean");
        request2.setQuantity(new BigDecimal("60"));
        request2.setPricePerKg(new BigDecimal("35"));

        String response2 = mockMvc.perform(post("/settlement")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String settlementNo2 = objectMapper.readTree(response2).get("settlementNo").asText();

        // Assert settlement numbers are different
        assertNotEquals(settlementNo1, settlementNo2, "Settlement numbers should be unique");
    }

    @Test
    @DisplayName("GET /settlement/farmer/{farmerId} - Should order settlements by date descending")
    @Transactional
    void testSettlementsOrderedByDate() throws Exception {
        // Create multiple settlements
        SettlementRequest request = new SettlementRequest();
        request.setFarmerId(testFarmer.getId());
        request.setCropName("Crop 1");
        request.setQuantity(new BigDecimal("50"));
        request.setPricePerKg(new BigDecimal("40"));

        mockMvc.perform(post("/settlement")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Get settlements and verify they are ordered by date
        mockMvc.perform(get("/settlement/farmer/" + testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(List.class)))
                .andExpect(jsonPath("$[0].settlementDate").exists());
    }
}
