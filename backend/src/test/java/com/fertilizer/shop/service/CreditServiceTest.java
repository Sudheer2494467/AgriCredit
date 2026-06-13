package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.CreditItemRequest;
import com.fertilizer.shop.dto.CreditVoucherRequest;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CreditServiceTest {

    @Mock private FarmerRepository farmerRepository;
    @Mock private ProductCategoryRepository categoryRepository;
    @Mock private ProductRepository productRepository;
    @Mock private StockRepository stockRepository;
    @Mock private StockMovementRepository stockMovementRepository;
    @Mock private CreditVoucherRepository creditVoucherRepository;

    @InjectMocks
    private CreditService creditService;

    private Farmer mockFarmer;
    private Product mockProduct;
    private ProductCategory mockCategory;
    private Stock mockStock;

    @BeforeEach
    void setUp() {
        mockFarmer = Farmer.builder()
                .id(1L)
                .name("Test Farmer")
                .currentBalance(new BigDecimal("1000"))
                .build();

        mockCategory = ProductCategory.builder().id(1L).name("Fertilizer").build();
        mockProduct = Product.builder().id(1L).name("Urea").build();

        mockStock = Stock.builder()
                .product(mockProduct)
                .quantity(new BigDecimal("50"))
                .build();
    }

    @Test
    void testCreateVoucherPendingApproval() {
        // Arrange
        CreditItemRequest itemReq = new CreditItemRequest();
        itemReq.setType(CreditItemType.PRODUCT);
        itemReq.setProductId(1L);
        itemReq.setCategoryId(1L);
        itemReq.setQuantity(new BigDecimal("5"));
        itemReq.setPrice(new BigDecimal("300"));

        CreditVoucherRequest request = new CreditVoucherRequest();
        request.setFarmerId(1L);
        request.setItems(Collections.singletonList(itemReq));
        request.setPendingApproval(true); // Should make it PENDING_APPROVAL

        when(farmerRepository.findById(1L)).thenReturn(Optional.of(mockFarmer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(creditVoucherRepository.save(any(CreditVoucher.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        CreditVoucher result = creditService.createVoucher(request);

        // Assert
        assertEquals(VoucherStatus.PENDING_APPROVAL, result.getStatus());
        assertEquals(new BigDecimal("1500"), result.getTotalCreditAmount());
        
        // Stock and Farmer balance should NOT be updated for pending vouchers
        verify(stockRepository, never()).save(any(Stock.class));
        verify(farmerRepository, never()).save(any(Farmer.class));
        verify(stockMovementRepository, never()).save(any(StockMovement.class));
    }

    @Test
    void testApproveVoucher() {
        // Arrange
        CreditVoucher pendingVoucher = CreditVoucher.builder()
                .id(1L)
                .farmer(mockFarmer)
                .status(VoucherStatus.PENDING_APPROVAL)
                .totalCreditAmount(new BigDecimal("1500"))
                .build();

        CreditItem item = CreditItem.builder()
                .voucher(pendingVoucher)
                .type(CreditItemType.PRODUCT)
                .product(mockProduct)
                .quantity(new BigDecimal("5"))
                .price(new BigDecimal("300"))
                .total(new BigDecimal("1500"))
                .build();
        pendingVoucher.getItems().add(item);

        when(creditVoucherRepository.findById(1L)).thenReturn(Optional.of(pendingVoucher));
        when(stockRepository.findByProduct(mockProduct)).thenReturn(Optional.of(mockStock));
        when(creditVoucherRepository.save(any(CreditVoucher.class))).thenAnswer(i -> i.getArgument(0));
        when(farmerRepository.save(any(Farmer.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        CreditVoucher result = creditService.approveVoucher(1L);

        // Assert
        assertEquals(VoucherStatus.CONFIRMED, result.getStatus());
        
        // Balance should be updated: 1000 + 1500 = 2500
        assertEquals(new BigDecimal("2500"), mockFarmer.getCurrentBalance());
        verify(farmerRepository).save(mockFarmer);

        // Stock should be updated: 50 - 5 = 45
        assertEquals(new BigDecimal("45"), mockStock.getQuantity());
        verify(stockRepository).save(mockStock);
        verify(stockMovementRepository).save(any(StockMovement.class));
    }
}
