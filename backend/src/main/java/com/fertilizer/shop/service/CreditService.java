package com.fertilizer.shop.service;

import com.fertilizer.shop.dto.CreditItemRequest;
import com.fertilizer.shop.dto.CreditVoucherRequest;
import com.fertilizer.shop.model.*;
import com.fertilizer.shop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditService {
    private final FarmerRepository farmerRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final CreditVoucherRepository creditVoucherRepository;

    @Transactional
    public CreditVoucher createVoucher(CreditVoucherRequest request) {
        Farmer farmer = farmerRepository.findById(request.getFarmerId()).orElseThrow();

        BigDecimal productTotal = BigDecimal.ZERO;
        BigDecimal cashTotal = BigDecimal.ZERO;

        VoucherStatus status = request.isPendingApproval()
                ? VoucherStatus.PENDING_APPROVAL
                : VoucherStatus.CONFIRMED;

        CreditVoucher voucher = CreditVoucher.builder()
                .voucherNo("CR-" + System.currentTimeMillis())
                .farmer(farmer)
                .createdAt(LocalDateTime.now())
                .status(status)
                .build();

        for (CreditItemRequest itemReq : request.getItems()) {
            BigDecimal qty = itemReq.getQuantity() == null ? BigDecimal.ONE : itemReq.getQuantity();
            BigDecimal price = itemReq.getPrice() == null ? BigDecimal.ZERO : itemReq.getPrice();
            BigDecimal lineTotal = qty.multiply(price);

            CreditItem item = CreditItem.builder()
                    .voucher(voucher)
                    .type(itemReq.getType())
                    .quantity(qty)
                    .price(price)
                    .total(lineTotal)
                    .build();

            if (itemReq.getType() == CreditItemType.PRODUCT) {
                Product product = productRepository.findById(itemReq.getProductId()).orElseThrow();
                ProductCategory category = categoryRepository.findById(itemReq.getCategoryId()).orElseThrow();
                item.setProduct(product);
                item.setCategory(category);
                productTotal = productTotal.add(lineTotal);

                if (status == VoucherStatus.CONFIRMED) {
                    Stock stock = stockRepository.findByProduct(product)
                            .orElseThrow(() -> new IllegalStateException("Stock not found for product " + product.getName()));
                    if (stock.getQuantity().compareTo(qty) < 0) {
                        throw new IllegalStateException("Insufficient stock for product " + product.getName());
                    }
                    stock.setQuantity(stock.getQuantity().subtract(qty));
                    stockRepository.save(stock);

                    stockMovementRepository.save(StockMovement.builder()
                            .product(product)
                            .movementType("OUT")
                            .quantity(qty)
                            .note("Credit voucher: " + voucher.getVoucherNo())
                            .movedAt(LocalDateTime.now())
                            .build());
                }
            } else {
                cashTotal = cashTotal.add(lineTotal);
            }

            voucher.getItems().add(item);
        }

        BigDecimal totalCredit = productTotal.add(cashTotal);
        voucher.setTotalProductAmount(productTotal);
        voucher.setTotalCashAmount(cashTotal);
        voucher.setTotalCreditAmount(totalCredit);

        if (status == VoucherStatus.CONFIRMED) {
            farmer.setCurrentBalance(farmer.getCurrentBalance().add(totalCredit));
            farmerRepository.save(farmer);
        }

        return creditVoucherRepository.save(voucher);
    }

    @Transactional
    public CreditVoucher approveVoucher(Long voucherId) {
        CreditVoucher voucher = creditVoucherRepository.findById(voucherId)
                .orElseThrow(() -> new IllegalStateException("Voucher not found: " + voucherId));

        if (voucher.getStatus() != VoucherStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Voucher is not in PENDING_APPROVAL state");
        }

        voucher.setStatus(VoucherStatus.CONFIRMED);

        Farmer farmer = voucher.getFarmer();

        // Now deduct stock and update balance
        for (CreditItem item : voucher.getItems()) {
            if (item.getType() == CreditItemType.PRODUCT) {
                Product product = item.getProduct();
                Stock stock = stockRepository.findByProduct(product)
                        .orElseThrow(() -> new IllegalStateException("Stock not found for product " + product.getName()));
                if (stock.getQuantity().compareTo(item.getQuantity()) < 0) {
                    throw new IllegalStateException("Insufficient stock for product " + product.getName());
                }
                stock.setQuantity(stock.getQuantity().subtract(item.getQuantity()));
                stockRepository.save(stock);

                stockMovementRepository.save(StockMovement.builder()
                        .product(product)
                        .movementType("OUT")
                        .quantity(item.getQuantity())
                        .note("Approved credit voucher: " + voucher.getVoucherNo())
                        .movedAt(LocalDateTime.now())
                        .build());
            }
        }

        farmer.setCurrentBalance(farmer.getCurrentBalance().add(voucher.getTotalCreditAmount()));
        farmerRepository.save(farmer);

        return creditVoucherRepository.save(voucher);
    }

    public List<CreditVoucher> getByFarmer(Long farmerId) {
        return creditVoucherRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<CreditVoucher> getPendingByFarmer(Long farmerId) {
        return creditVoucherRepository.findByFarmerIdAndStatus(farmerId, VoucherStatus.PENDING_APPROVAL);
    }
}
