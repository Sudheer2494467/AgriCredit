package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.SettlementRequest;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@DisplayName("Settlement Service Tests")
class SettlementServiceTest {

    @Mock
    private FarmerRepository farmerRepository;
    @Mock
    private InterestRecordRepository interestRecordRepository;
    @Mock
    private SettlementRepository settlementRepository;
    @Mock
    private CreditVoucherRepository creditVoucherRepository;
    @Mock
    private StoreSettingsRepository storeSettingsRepository;

    @InjectMocks
    private SettlementService settlementService;

    private Farmer testFarmer;
    private CreditVoucher testVoucher;
    private SettlementRequest settlementRequest;
    private StoreSettings storeSettings;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Initialize test data
        testFarmer = Farmer.builder()
                .id(1L)
                .name("Test Farmer")
                .phone("9999999999")
                .village("Test Village")
                .landAcres(new BigDecimal("5"))
                .currentBalance(new BigDecimal("1000.00"))
                .build();

        testVoucher = CreditVoucher.builder()
                .id(1L)
                .voucherNo("V-001")
                .farmer(testFarmer)
                .status(VoucherStatus.CONFIRMED)
                .totalCreditAmount(new BigDecimal("1000.00"))
                .createdAt(LocalDateTime.now().minusMonths(2))
                .items(createTestItems())
                .build();

        settlementRequest = new SettlementRequest();
        settlementRequest.setFarmerId(1L);
        settlementRequest.setCropName("Cotton");
        settlementRequest.setQuantity(new BigDecimal("100"));
        settlementRequest.setPricePerKg(new BigDecimal("50"));

        storeSettings = StoreSettings.builder()
                .id(1L)
                .productInterestRate(new BigDecimal("2.0"))
                .cashInterestRate(new BigDecimal("2.0"))
                .build();
    }

    private List<CreditItem> createTestItems() {
        List<CreditItem> items = new ArrayList<>();
        CreditItem item = new CreditItem();
        item.setId(1L);
        item.setType(CreditItemType.CASH);
        item.setQuantity(new BigDecimal("1"));
        item.setPrice(new BigDecimal("1000.00"));
        item.setTotal(new BigDecimal("1000.00"));
        items.add(item);
        return items;
    }

    @Test
    @DisplayName("Should create settlement when crop value is greater than debt")
    void testCreateSettlementWithPositivePayout() {
        // Setup
        testFarmer.setCurrentBalance(new BigDecimal("1000.00"));
        settlementRequest.setQuantity(new BigDecimal("100"));
        settlementRequest.setPricePerKg(new BigDecimal("50")); // 5000 crop value

        when(farmerRepository.findById(1L)).thenReturn(Optional.of(testFarmer));
        when(creditVoucherRepository.findByFarmerIdAndIsSettledFalse(1L))
                .thenReturn(List.of(testVoucher));
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(storeSettings));
        when(settlementRepository.save(any(Settlement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(farmerRepository.save(any(Farmer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Execute
        Settlement result = settlementService.createSettlement(settlementRequest);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getSettlementNo());
        assertTrue(result.getNetPayout().compareTo(BigDecimal.ZERO) >= 0);
        assertEquals(BigDecimal.ZERO, result.getRemainingBalance());
        assertEquals(testFarmer, result.getFarmer());

        verify(farmerRepository, times(1)).save(any(Farmer.class));
        verify(settlementRepository, times(1)).save(any(Settlement.class));
    }

    @Test
    @DisplayName("Should create settlement with remaining balance when crop value less than debt")
    void testCreateSettlementWithRemainingBalance() {
        // Setup
        testFarmer.setCurrentBalance(new BigDecimal("5000.00"));
        settlementRequest.setQuantity(new BigDecimal("50"));
        settlementRequest.setPricePerKg(new BigDecimal("25")); // 1250 crop value (less than debt)

        when(farmerRepository.findById(1L)).thenReturn(Optional.of(testFarmer));
        when(creditVoucherRepository.findByFarmerIdAndIsSettledFalse(1L))
                .thenReturn(List.of(testVoucher));
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(storeSettings));
        when(settlementRepository.save(any(Settlement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(farmerRepository.save(any(Farmer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Execute
        Settlement result = settlementService.createSettlement(settlementRequest);

        // Assert
        assertNotNull(result);
        assertTrue(result.getRemainingBalance().compareTo(BigDecimal.ZERO) > 0);
        assertEquals(BigDecimal.ZERO, result.getNetPayout());
        assertTrue(result.getRemainingBalance().compareTo(new BigDecimal("5000.00")) < 0);

        verify(farmerRepository, times(1)).save(any(Farmer.class));
        verify(settlementRepository, times(1)).save(any(Settlement.class));
    }

    @Test
    @DisplayName("Should handle multiple settlements sequentially")
    void testMultipleSettlementsSequential() {
        // First settlement
        testFarmer.setCurrentBalance(new BigDecimal("1000.00"));

        when(farmerRepository.findById(1L)).thenReturn(Optional.of(testFarmer));
        when(creditVoucherRepository.findByFarmerIdAndIsSettledFalse(1L))
                .thenReturn(List.of(testVoucher));
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(storeSettings));
        when(settlementRepository.save(any(Settlement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(farmerRepository.save(any(Farmer.class)))
                .thenAnswer(invocation -> {
                    Farmer f = (Farmer) invocation.getArgument(0);
                    return f;
                });

        // First settlement
        settlementRequest.setQuantity(new BigDecimal("50"));
        settlementRequest.setPricePerKg(new BigDecimal("25")); // 1250
        Settlement settlement1 = settlementService.createSettlement(settlementRequest);

        assertNotNull(settlement1);
        assertTrue(settlement1.getCreditDeducted().compareTo(BigDecimal.ZERO) > 0);

        // Verify settlement count
        verify(settlementRepository, times(1)).save(any(Settlement.class));
    }

    @Test
    @DisplayName("Should return settlements ordered by date")
    void testGetSettlementsByFarmer() {
        // Setup
        List<Settlement> expectedSettlements = new ArrayList<>();
        Settlement s1 = Settlement.builder()
                .id(1L)
                .settlementNo("ST-001")
                .farmer(testFarmer)
                .settlementDate(LocalDate.now().minusDays(10))
                .creditDeducted(new BigDecimal("500"))
                .interestDeducted(new BigDecimal("50"))
                .netPayout(new BigDecimal("450"))
                .remainingBalance(BigDecimal.ZERO)
                .build();

        Settlement s2 = Settlement.builder()
                .id(2L)
                .settlementNo("ST-002")
                .farmer(testFarmer)
                .settlementDate(LocalDate.now())
                .creditDeducted(new BigDecimal("300"))
                .interestDeducted(new BigDecimal("30"))
                .netPayout(new BigDecimal("270"))
                .remainingBalance(BigDecimal.ZERO)
                .build();

        expectedSettlements.add(s2);
        expectedSettlements.add(s1);

        when(settlementRepository.findByFarmerIdOrderBySettlementDateDesc(1L))
                .thenReturn(expectedSettlements);

        // Execute
        List<Settlement> result = settlementService.getByFarmer(1L);

        // Assert
        assertEquals(2, result.size());
        assertEquals("ST-002", result.get(0).getSettlementNo());
        assertEquals("ST-001", result.get(1).getSettlementNo());

        verify(settlementRepository, times(1)).findByFarmerIdOrderBySettlementDateDesc(1L);
    }

    @Test
    @DisplayName("Should calculate interest correctly for multiple credit vouchers")
    void testInterestCalculation() {
        // Setup - create 2 credit vouchers with different ages
        CreditVoucher oldVoucher = CreditVoucher.builder()
                .id(1L)
                .voucherNo("V-OLD")
                .farmer(testFarmer)
                .status(VoucherStatus.CONFIRMED)
                .totalCreditAmount(new BigDecimal("500.00"))
                .createdAt(LocalDateTime.now().minusMonths(3))
                .items(createTestItems())
                .build();

        CreditVoucher newVoucher = CreditVoucher.builder()
                .id(2L)
                .voucherNo("V-NEW")
                .farmer(testFarmer)
                .status(VoucherStatus.CONFIRMED)
                .totalCreditAmount(new BigDecimal("500.00"))
                .createdAt(LocalDateTime.now().minusMonths(1))
                .items(createTestItems())
                .build();

        when(farmerRepository.findById(1L)).thenReturn(Optional.of(testFarmer));
        when(creditVoucherRepository.findByFarmerIdAndIsSettledFalse(1L))
                .thenReturn(List.of(oldVoucher, newVoucher));
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(storeSettings));
        when(settlementRepository.save(any(Settlement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(farmerRepository.save(any(Farmer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Execute
        Settlement result = settlementService.createSettlement(settlementRequest);

        // Assert - interest should be calculated and recorded
        assertNotNull(result.getInterestDeducted());
        assertTrue(result.getInterestDeducted().compareTo(BigDecimal.ZERO) >= 0);

        verify(interestRecordRepository, times(1)).save(any(InterestRecord.class));
    }

    @Test
    @DisplayName("Should mark credit vouchers as settled")
    void testVouchersMarkedAsSettled() {
        // Setup
        when(farmerRepository.findById(1L)).thenReturn(Optional.of(testFarmer));
        when(creditVoucherRepository.findByFarmerIdAndIsSettledFalse(1L))
                .thenReturn(List.of(testVoucher));
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(storeSettings));
        when(settlementRepository.save(any(Settlement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(farmerRepository.save(any(Farmer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Execute
        Settlement result = settlementService.createSettlement(settlementRequest);

        // Assert - verify credit voucher was marked as settled
        assertTrue(testVoucher.isSettled());
        assertEquals(VoucherStatus.SETTLED, testVoucher.getStatus());

        verify(creditVoucherRepository, times(1)).save(testVoucher);
    }

    @Test
    @DisplayName("Should update farmer balance after settlement")
    void testFarmerBalanceUpdated() {
        // Setup
        BigDecimal originalBalance = new BigDecimal("1000.00");
        testFarmer.setCurrentBalance(originalBalance);

        when(farmerRepository.findById(1L)).thenReturn(Optional.of(testFarmer));
        when(creditVoucherRepository.findByFarmerIdAndIsSettledFalse(1L))
                .thenReturn(List.of(testVoucher));
        when(storeSettingsRepository.findById(1L)).thenReturn(Optional.of(storeSettings));
        when(settlementRepository.save(any(Settlement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(farmerRepository.save(any(Farmer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Execute
        Settlement result = settlementService.createSettlement(settlementRequest);

        // Assert - farmer balance should be updated
        assertNotNull(result);
        assertTrue(testFarmer.getCurrentBalance().compareTo(originalBalance) <= 0);

        verify(farmerRepository, times(1)).save(any(Farmer.class));
    }
}
