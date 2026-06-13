import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { MyCreditsComponent } from "./my-credits.component";
import { ApiService } from "../core/api.service";
import { AuthService } from "../core/auth.service";
import { of, throwError } from "rxjs";

describe("MyCreditsComponent - Credit Approval and Display", () => {
  let component: MyCreditsComponent;
  let fixture: ComponentFixture<MyCreditsComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockPendingVoucher = {
    id: 1,
    voucherNo: "CR-123456",
    farmerId: 1,
    status: "PENDING_APPROVAL",
    createdAt: "2024-01-01T10:00:00",
    totalCreditAmount: 5000,
    totalProductAmount: 3000,
    totalCashAmount: 2000,
    items: [
      {
        id: 1,
        type: "PRODUCT",
        quantity: 10,
        price: 300,
        total: 3000,
        product: { id: 1, name: "Fertilizer A" },
      },
      {
        id: 2,
        type: "CASH",
        quantity: 1,
        price: 2000,
        total: 2000,
      },
    ],
  };

  const mockConfirmedVoucher = {
    ...mockPendingVoucher,
    status: "CONFIRMED",
  };

  const mockSettledVoucher = {
    ...mockPendingVoucher,
    id: 3,
    voucherNo: "CR-789012",
    status: "SETTLED",
    totalCreditAmount: 3000,
  };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj("ApiService", [
      "farmerCredits",
      "approveCredit",
    ]);

    mockAuthService = jasmine.createSpyObj("AuthService", ["getFarmerId"]);

    await TestBed.configureTestingModule({
      imports: [MyCreditsComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyCreditsComponent);
    component = fixture.componentInstance;
  });

  describe("Initial Load", () => {
    it("should load all vouchers on init", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        of([mockPendingVoucher, mockConfirmedVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.vouchers.length).toBe(2);
      expect(component.loading).toBe(false);
    }));

    it("should identify pending vouchers", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        of([mockPendingVoucher, mockConfirmedVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.pendingVouchers.length).toBe(1);
      expect(component.pendingVouchers[0].status).toBe("PENDING_APPROVAL");
      expect(component.pendingCount).toBe(1);
    }));

    it("should calculate total amount excluding pending vouchers", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        of([
          mockPendingVoucher, // 5000 - should be excluded
          mockConfirmedVoucher, // 5000 - should be included
          mockSettledVoucher, // 3000 - should be included
        ]),
      );

      component.ngOnInit();
      tick();

      expect(component.totalAmount).toBe(8000);
    }));

    it("should handle loading state", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      expect(component.loading).toBe(true);

      component.ngOnInit();
      tick();

      expect(component.loading).toBe(false);
    }));

    it("should handle API error gracefully", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        throwError(() => new Error("API Error")),
      );

      component.ngOnInit();
      tick();

      expect(component.loading).toBe(false);
      expect(component.vouchers.length).toBe(0);
    }));

    it("should not load if no farmer ID", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(null);

      component.ngOnInit();
      tick();

      expect(mockApiService.farmerCredits).not.toHaveBeenCalled();
    }));
  });

  describe("Approval Workflow", () => {
    it("should set approving state when approving", fakeAsync(() => {
      const voucher = { ...mockPendingVoucher };
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.approveCredit.and.returnValue(of(mockConfirmedVoucher));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      component.approve(voucher);
      tick();

      expect(voucher.approving).toBe(true);
    }));

    it("should reload data after successful approval", fakeAsync(() => {
      const voucher = { ...mockPendingVoucher };
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.approveCredit.and.returnValue(of(mockConfirmedVoucher));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      component.approve(voucher);
      tick();

      expect(mockApiService.farmerCredits).toHaveBeenCalledWith(1);
    }));

    it("should update pending status after approval", fakeAsync(() => {
      const voucher = { ...mockPendingVoucher };
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.approveCredit.and.returnValue(of(mockConfirmedVoucher));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      component.approve(voucher);
      tick();

      expect(component.pendingVouchers.length).toBe(0);
      expect(component.pendingCount).toBe(0);
    }));

    it("should update total amount after approval", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(of([mockPendingVoucher]));
      component.ngOnInit();
      tick();

      expect(component.totalAmount).toBe(0);

      const voucher = { ...mockPendingVoucher };
      mockApiService.approveCredit.and.returnValue(of(mockConfirmedVoucher));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      component.approve(voucher);
      tick();

      expect(component.totalAmount).toBe(5000);
    }));

    it("should handle approval error", fakeAsync(() => {
      const voucher = { ...mockPendingVoucher, approving: false };
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.approveCredit.and.returnValue(
        throwError(() => new Error("Approval failed")),
      );

      component.approve(voucher);
      tick();

      expect(voucher.approving).toBe(false);
    }));
  });

  describe("Data Display", () => {
    it("should display mixed voucher statuses", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        of([mockPendingVoucher, mockConfirmedVoucher, mockSettledVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.vouchers.length).toBe(3);
      expect(
        component.vouchers.filter((v: any) => v.status === "PENDING_APPROVAL")
          .length,
      ).toBe(1);
      expect(
        component.vouchers.filter((v: any) => v.status === "CONFIRMED").length,
      ).toBe(1);
      expect(
        component.vouchers.filter((v: any) => v.status === "SETTLED").length,
      ).toBe(1);
    }));

    it("should calculate correct counts", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        of([mockPendingVoucher, mockPendingVoucher, mockConfirmedVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.pendingCount).toBe(2);
      expect(component.vouchers.length).toBe(3);
      expect(component.totalAmount).toBe(5000);
    }));
  });

  describe("Date Formatting", () => {
    it("should format dates correctly", () => {
      const dateStr = "2024-01-15T10:30:00";
      const formatted = component.formatDate(dateStr);
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });
  });

  describe("Status Labels", () => {
    it("should return correct status labels", () => {
      expect(component.getStatusLabel("CONFIRMED")).toBe("Confirmed");
      expect(component.getStatusLabel("PENDING_APPROVAL")).toBe(
        "Pending Approval",
      );
      expect(component.getStatusLabel("SETTLED")).toBe("Settled");
      expect(component.getStatusLabel("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty vouchers list", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(of([]));

      component.ngOnInit();
      tick();

      expect(component.vouchers.length).toBe(0);
      expect(component.pendingVouchers.length).toBe(0);
      expect(component.pendingCount).toBe(0);
      expect(component.totalAmount).toBe(0);
    }));

    it("should handle only pending vouchers", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        of([mockPendingVoucher, mockPendingVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.vouchers.length).toBe(2);
      expect(component.pendingCount).toBe(2);
      expect(component.totalAmount).toBe(0);
    }));

    it("should handle only confirmed vouchers", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.farmerCredits.and.returnValue(
        of([mockConfirmedVoucher, mockConfirmedVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.vouchers.length).toBe(2);
      expect(component.pendingCount).toBe(0);
      expect(component.totalAmount).toBe(10000);
    }));
  });
});
