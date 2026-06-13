package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.CreditItemRequest;
import com.fertilizer.shop.dto.CreditVoucherRequest;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class CreditServiceIntegrationTest {

    @Autowired
    private CreditService creditService;

    @Autowired
    private CreditVoucherRepository creditVoucherRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryRepository categoryRepository;

    @Autowired
    private StockRepository stockRepository;

    private Farmer testFarmer;
    private Product testProduct;
    private ProductCategory testCategory;
    private Stock testStock;

    @BeforeEach
    void setUp() {
        // Create test farmer
        testFarmer = Farmer.builder()
                .name("Test Farmer")
                .phone("9876543210")
                .village("Test Village")
                .landAcres(new BigDecimal("5"))
                .currentBalance(new BigDecimal("0"))
                .build();
        testFarmer = farmerRepository.save(testFarmer);

        // Create test category
        testCategory = ProductCategory.builder()
                .name("Fertilizers" + UUID.randomUUID().toString())
                .build();
        testCategory = categoryRepository.save(testCategory);

        // Create test product
        testProduct = Product.builder()
                .name("NPK 10:26:26")
                .category(testCategory)
                .pricePerUnit(new BigDecimal("300"))
                .build();
        testProduct = productRepository.save(testProduct);

        // Create test stock
        testStock = Stock.builder()
                .product(testProduct)
                .quantity(new BigDecimal("1000"))
                .build();
        testStock = stockRepository.save(testStock);
    }

    @Test
    void testCreatePendingApprovalVoucher() {
        // Arrange
        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        // Act
        CreditVoucher result = creditService.createVoucher(request);

        // Assert
        assertNotNull(result.getId());
        assertEquals(VoucherStatus.PENDING_APPROVAL, result.getStatus());
        assertEquals(new BigDecimal("3000"), result.getTotalProductAmount());
        assertEquals(new BigDecimal("0"), result.getTotalCashAmount());
        assertEquals(new BigDecimal("3000"), result.getTotalCreditAmount());
        assertTrue(result.getVoucherNo().startsWith("CR-"));
    }

    @Test
    void testPendingVoucherDoesNotDeductStock() {
        // Arrange
        BigDecimal initialStock = testStock.getQuantity();

        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        // Act
        creditService.createVoucher(request);

        // Assert
        Stock updatedStock = stockRepository.findByProduct(testProduct).orElseThrow();
        assertEquals(initialStock, updatedStock.getQuantity());
    }

    @Test
    void testPendingVoucherDoesNotUpdateFarmerBalance() {
        // Arrange
        BigDecimal initialBalance = testFarmer.getCurrentBalance();

        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        // Act
        creditService.createVoucher(request);

        // Assert
        Farmer updatedFarmer = farmerRepository.findById(testFarmer.getId()).orElseThrow();
        assertEquals(initialBalance, updatedFarmer.getCurrentBalance());
    }

    @Test
    void testCreateConfirmedVoucher() {
        // Arrange
        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("5"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(productItem))
                .build();

        // Act
        CreditVoucher result = creditService.createVoucher(request);

        // Assert
        assertEquals(VoucherStatus.CONFIRMED, result.getStatus());
        assertEquals(new BigDecimal("1500"), result.getTotalCreditAmount());
    }

    @Test
    void testConfirmedVoucherDeductsStock() {
        // Arrange
        BigDecimal initialStock = testStock.getQuantity();

        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(productItem))
                .build();

        // Act
        creditService.createVoucher(request);

        // Assert
        Stock updatedStock = stockRepository.findByProduct(testProduct).orElseThrow();
        assertEquals(initialStock.subtract(new BigDecimal("10")), updatedStock.getQuantity());
    }

    @Test
    void testConfirmedVoucherUpdatesFarmerBalance() {
        // Arrange
        BigDecimal initialBalance = testFarmer.getCurrentBalance();

        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(productItem))
                .build();

        // Act
        CreditVoucher voucher = creditService.createVoucher(request);

        // Assert
        Farmer updatedFarmer = farmerRepository.findById(testFarmer.getId()).orElseThrow();
        assertEquals(initialBalance.add(voucher.getTotalCreditAmount()), updatedFarmer.getCurrentBalance());
    }

    @Test
    void testApproveVoucher() {
        // Arrange - Create pending voucher
        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        CreditVoucher pendingVoucher = creditService.createVoucher(request);

        // Act
        CreditVoucher approvedVoucher = creditService.approveVoucher(pendingVoucher.getId());

        // Assert
        assertEquals(VoucherStatus.CONFIRMED, approvedVoucher.getStatus());
    }

    @Test
    void testApproveVoucherDeductsStock() {
        // Arrange
        BigDecimal initialStock = testStock.getQuantity();

        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        CreditVoucher pendingVoucher = creditService.createVoucher(request);

        // Act
        creditService.approveVoucher(pendingVoucher.getId());

        // Assert
        Stock updatedStock = stockRepository.findByProduct(testProduct).orElseThrow();
        assertEquals(initialStock.subtract(new BigDecimal("10")), updatedStock.getQuantity());
    }

    @Test
    void testApproveVoucherUpdatesFarmerBalance() {
        // Arrange
        BigDecimal initialBalance = testFarmer.getCurrentBalance();

        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        CreditVoucher pendingVoucher = creditService.createVoucher(request);

        // Act
        CreditVoucher approvedVoucher = creditService.approveVoucher(pendingVoucher.getId());

        // Assert
        Farmer updatedFarmer = farmerRepository.findById(testFarmer.getId()).orElseThrow();
        assertEquals(initialBalance.add(approvedVoucher.getTotalCreditAmount()), updatedFarmer.getCurrentBalance());
    }

    @Test
    void testGetVouchersByFarmer() {
        // Arrange
        CreditItemRequest productItem1 = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("5"))
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request1 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(productItem1))
                .build();

        CreditItemRequest productItem2 = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("2000"))
                .build();

        CreditVoucherRequest request2 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem2))
                .build();

        creditService.createVoucher(request1);
        creditService.createVoucher(request2);

        // Act
        List<CreditVoucher> vouchers = creditService.getByFarmer(testFarmer.getId());

        // Assert
        assertEquals(2, vouchers.size());
    }

    @Test
    void testGetPendingVouchersByFarmer() {
        // Arrange
        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("2000"))
                .build();

        CreditVoucherRequest request1 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        CreditVoucherRequest request2 = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Collections.singletonList(productItem))
                .build();

        creditService.createVoucher(request1);
        creditService.createVoucher(request2);

        // Act
        List<CreditVoucher> pendingVouchers = creditService.getPendingByFarmer(testFarmer.getId());

        // Assert
        assertEquals(2, pendingVouchers.size());
        assertTrue(pendingVouchers.stream().allMatch(v -> v.getStatus() == VoucherStatus.PENDING_APPROVAL));
    }

    @Test
    void testApproveVoucherThrowsErrorIfNotPending() {
        // Arrange - Create and approve a voucher
        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("2000"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(productItem))
                .build();

        CreditVoucher voucher = creditService.createVoucher(request);

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            creditService.approveVoucher(voucher.getId());
        });
    }

    @Test
    void testCreateVoucherWithMultipleItems() {
        // Arrange
        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("300"))
                .build();

        CreditItemRequest cashItem = CreditItemRequest.builder()
                .type(CreditItemType.CASH)
                .quantity(new BigDecimal("1"))
                .price(new BigDecimal("2000"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(true)
                .items(Arrays.asList(productItem, cashItem))
                .build();

        // Act
        CreditVoucher result = creditService.createVoucher(request);

        // Assert
        assertEquals(2, result.getItems().size());
        assertEquals(new BigDecimal("3000"), result.getTotalProductAmount());
        assertEquals(new BigDecimal("2000"), result.getTotalCashAmount());
        assertEquals(new BigDecimal("5000"), result.getTotalCreditAmount());
    }

    @Test
    void testInsufficientStockThrowsError() {
        // Arrange - Update stock to be low
        testStock.setQuantity(new BigDecimal("5"));
        stockRepository.save(testStock);

        CreditItemRequest productItem = CreditItemRequest.builder()
                .type(CreditItemType.PRODUCT)
                .categoryId(testCategory.getId())
                .productId(testProduct.getId())
                .quantity(new BigDecimal("10")) // More than available
                .price(new BigDecimal("300"))
                .build();

        CreditVoucherRequest request = CreditVoucherRequest.builder()
                .farmerId(testFarmer.getId())
                .pendingApproval(false)
                .items(Collections.singletonList(productItem))
                .build();

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            creditService.createVoucher(request);
        });
    }
}
