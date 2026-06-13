package com.fertilizer.shop.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CreditVoucherRequest {
    private Long farmerId;
    private List<CreditItemRequest> items;
    private boolean pendingApproval;
}
