package com.fertilizer.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fertilizer.shop.dto.CreditItemRequest;
import com.fertilizer.shop.dto.CreditVoucherRequest;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import com.fertilizer.shop.service.CreditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@Transactional
class CreditControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CreditService creditService;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private CreditVoucherRepository creditVoucherRepository;

    private Farmer testFarmer;
    private Product testProduct;
    private ProductCategory testCategory;
    private Stock testStock;

    @BeforeEach
    void setUp() {
        creditVoucherRepository.deleteAll();
        stockRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        farmerRepository.deleteAll();

        testFarmer = farmerRepository.save(
                Farmer.builder()
                        .name("Test Farmer")
                        .phone("9876543210")
                        .village("Test Village")
                        .landAcres(new BigDecimal("5"))
                        .currentBalance(new BigDecimal("0"))
                        .build()
        );

        testCategory = categoryRepository.save(
                ProductCategory.builder()
                        .name("Fertilizers" + java.util.UUID.randomUUID().toString())
                        .build()
        );

        testProduct = productRepository.save(
                Product.builder()
                        .name("NPK 10:26:26")
                        .category(testCategory)
                        .pricePerUnit(new BigDecimal("300"))
                        .build()
        );

        testStock = stockRepository.save(
                Stock.builder()
                        .product(testProduct)
                        .quantity(new BigDecimal("1000"))
                        .build()
        );
    }

    @Test
    void testCreatePendingApprovalVoucher() throws Exception {
        // Arrange
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        // Act & Assert
        mockMvc.perform(post("/credit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.totalCreditAmount").value(3000))
                .andExpect(jsonPath("$.voucherNo").isNotEmpty())
                .andExpect(jsonPath("$.voucherNo").value(containsString("CR-")));
    }

    @Test
    void testCreateConfirmedVoucher() throws Exception {
        // Arrange
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("5"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(itemRequest))
                .build();

        // Act & Assert
        mockMvc.perform(post("/credit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.totalCreditAmount").value(1500));
    }

    @Test
    void testGetVouchersByFarmer() throws Exception {
        // Arrange - Create multiple vouchers
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("2000"))
                .build();

        CreditVoucherRequest request1 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        CreditVoucherRequest request2 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(itemRequest))
                .build();

        creditService.createVoucher(request1);
        creditService.createVoucher(request2);

        // Act & Assert
        mockMvc.perform(get("/credit/farmer/{farmerId}", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED")) // Most recent first
                .andExpect(jsonPath("$[1].status").value("PENDING_APPROVAL"));
    }

    @Test
    void testGetPendingVouchersByFarmer() throws Exception {
        // Arrange - Create multiple vouchers
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("2000"))
                .build();

        CreditVoucherRequest request1 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        CreditVoucherRequest request2 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(itemRequest))
                .build();

        creditService.createVoucher(request1);
        creditService.createVoucher(request2);

        // Act & Assert
        mockMvc.perform(get("/credit/farmer/{farmerId}/pending", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("PENDING_APPROVAL"));
    }

    @Test
    void testApproveVoucher() throws Exception {
        // Arrange
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("2000"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        CreditVoucher voucher = creditService.createVoucher(request);

        // Act & Assert
        mockMvc.perform(put("/credit/{id}/approve", voucher.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.id").value(voucher.getId()));
    }

    @Test
    void testApprovalChangesVoucherStatus() throws Exception {
        // Arrange
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("5000"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        CreditVoucher voucher = creditService.createVoucher(request);
        Long voucherId = voucher.getId();

        // Act - Verify it's pending
        mockMvc.perform(get("/credit/farmer/{farmerId}/pending", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        // Act - Approve
        mockMvc.perform(put("/credit/{id}/approve", voucherId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // Act - Verify it's no longer pending
        mockMvc.perform(get("/credit/farmer/{farmerId}/pending", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Act - Verify it's in the full list
        mockMvc.perform(get("/credit/farmer/{farmerId}", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));
    }

    @Test
    void testPendingVoucherNotDisplayedInBalance() throws Exception {
        // Arrange
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("5000"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        creditService.createVoucher(request);

        // Act
        Farmer updatedFarmer = farmerRepository.findById(testFarmer.getId()).orElseThrow();

        // Assert - Balance should not be updated for pending
        assert updatedFarmer.getCurrentBalance().compareTo(BigDecimal.ZERO) == 0;
    }

    @Test
    void testApprovedVoucherUpdatesBalance() throws Exception {
        // Arrange
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("5000"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        CreditVoucher voucher = creditService.createVoucher(request);

        // Act
        mockMvc.perform(put("/credit/{id}/approve", voucher.getId()))
                .andExpect(status().isOk());

        // Assert
        Farmer updatedFarmer = farmerRepository.findById(testFarmer.getId()).orElseThrow();
        assert updatedFarmer.getCurrentBalance().compareTo(new BigDecimal("5000")) == 0;
    }

    @Test
    void testFullWorkflow_Create_Poll_Approve_Display() throws Exception {
        // Step 1: Create pending voucher
        CreditItemRequest itemRequest = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("5000"))
                .build();

        CreditVoucherRequest createRequest = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(itemRequest))
                .build();

        MvcResult createResult = mockMvc.perform(post("/credit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andReturn();

        String response = createResult.getResponse().getContentAsString();
        String voucherId = objectMapper.readTree(response).get("id").asText();

        // Step 2: Poll for pending - should see 1 pending
        mockMvc.perform(get("/credit/farmer/{farmerId}/pending", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("PENDING_APPROVAL"));

        // Step 3: Approve
        mockMvc.perform(put("/credit/{id}/approve", voucherId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // Step 4: Poll again - should see 0 pending
        mockMvc.perform(get("/credit/farmer/{farmerId}/pending", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Step 5: Check all vouchers - should see confirmed
        mockMvc.perform(get("/credit/farmer/{farmerId}", testFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));

        // Step 6: Verify balance updated
        Farmer updatedFarmer = farmerRepository.findById(testFarmer.getId()).orElseThrow();
        assert updatedFarmer.getCurrentBalance().compareTo(new BigDecimal("5000")) == 0;
    }

    @Test
    void testEmptyPendingListForNewFarmer() throws Exception {
        // Create new farmer with no vouchers
        Farmer newFarmer = farmerRepository.save(
                Farmer.builder()
                        .name("New Farmer")
                        .phone("9999999999")
                        .village("New Village")
                        .landAcres(new BigDecimal("2"))
                        .currentBalance(new BigDecimal("0"))
                        .build()
        );

        // Act & Assert
        mockMvc.perform(get("/credit/farmer/{farmerId}/pending", newFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/credit/farmer/{farmerId}", newFarmer.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
