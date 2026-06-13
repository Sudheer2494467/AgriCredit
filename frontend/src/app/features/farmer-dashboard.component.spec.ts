import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { FarmerDashboardComponent } from "./farmer-dashboard.component";
import { ApiService } from "../core/api.service";
import { AuthService } from "../core/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";

describe("FarmerDashboardComponent - Credit Display and Approval Workflow", () => {
  let component: FarmerDashboardComponent;
  let fixture: ComponentFixture<FarmerDashboardComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockFarmer = {
    id: 1,
    name: "John Doe",
    phone: "9876543210",
    village: "Test Village",
    landAcres: 5,
    currentBalance: 1000,
  };

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
    id: 1,
    status: "CONFIRMED",
    voucherNo: "CR-123456",
  };

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj("ApiService", [
      "getFarmer",
      "farmerCredits",
      "farmerPendingCredits",
      "approveCredit",
    ]);

    mockAuthService = jasmine.createSpyObj("AuthService", ["getFarmerId"]);
    mockRouter = jasmine.createSpyObj("Router", ["navigate"]);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => null,
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [FarmerDashboardComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmerDashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    if (component.pollTimer) {
      clearInterval(component.pollTimer);
    }
  });

  describe("Initial Load - Pending Vouchers", () => {
    it("should load farmer data and display pending vouchers", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockPendingVoucher]));

      component.ngOnInit();
      tick();

      expect(component.farmer).toEqual(mockFarmer);
      expect(component.creditVouchers.length).toBe(1);
      expect(component.pendingVouchers.length).toBe(1);
      expect(component.pendingVouchers[0].status).toBe("PENDING_APPROVAL");
    }));

    it("should separate pending and confirmed vouchers", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(
        of([mockPendingVoucher, mockConfirmedVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.creditVouchers.length).toBe(2);
      expect(component.pendingVouchers.length).toBe(1);
      expect(component.pendingVouchers[0].id).toBe(1);
    }));

    it("should calculate total credit excluding pending vouchers", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(
        of([
          mockPendingVoucher,
          { ...mockConfirmedVoucher, id: 2, totalCreditAmount: 3000 },
        ]),
      );

      component.ngOnInit();
      tick();

      expect(component.totalCredit).toBe(3000);
    }));
  });

  describe("Polling for Approval Status Changes", () => {
    it("should trigger polling interval when not in admin view", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockPendingVoucher]));
      mockApiService.farmerPendingCredits.and.returnValue(
        of([mockPendingVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.pollTimer).toBeTruthy();
    }));

    it("should refresh creditVouchers when pending count changes (approval detected)", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockPendingVoucher]));
      mockApiService.farmerPendingCredits.and.returnValue(
        of([mockPendingVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.pendingVouchers.length).toBe(1);
      expect(mockApiService.farmerCredits).toHaveBeenCalledTimes(1);

      // Simulate approval - pending list becomes empty
      mockApiService.farmerPendingCredits.and.returnValue(of([]));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      // Trigger the polling
      component.checkPending(1);
      tick();

      expect(component.pendingVouchers.length).toBe(0);
      expect(component.creditVouchers[0].status).toBe("CONFIRMED");
      expect(mockApiService.farmerCredits).toHaveBeenCalledTimes(2);
    }));

    it("should update totalCredit after approval", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockPendingVoucher]));
      mockApiService.farmerPendingCredits.and.returnValue(
        of([mockPendingVoucher]),
      );

      component.ngOnInit();
      tick();

      expect(component.totalCredit).toBe(0); // Pending not counted

      // Simulate approval
      mockApiService.farmerPendingCredits.and.returnValue(of([]));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      component.checkPending(1);
      tick();

      expect(component.totalCredit).toBe(5000); // Now counted
    }));

    it("should not refetch if pending count did not change", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockPendingVoucher]));
      mockApiService.farmerPendingCredits.and.returnValue(
        of([mockPendingVoucher]),
      );

      component.ngOnInit();
      tick();

      const initialCallCount = mockApiService.farmerCredits.calls.count();

      // Check pending but no change
      component.checkPending(1);
      tick();

      expect(mockApiService.farmerCredits.calls.count()).toBe(initialCallCount);
    }));
  });

  describe("Admin View", () => {
    it("should load farmer data when viewing specific farmer as admin", fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get = (key: string) =>
        key === "id" ? "1" : null;
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      component.ngOnInit();
      tick();

      expect(component.isAdminView).toBe(true);
      expect(component.farmer).toEqual(mockFarmer);
      expect(component.creditVouchers.length).toBe(1);
    }));

    it("should not set up polling in admin view", fakeAsync(() => {
      mockActivatedRoute.snapshot.paramMap.get = (key: string) =>
        key === "id" ? "1" : null;
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockConfirmedVoucher]));

      component.ngOnInit();
      tick();

      expect(component.pollTimer).toBeFalsy();
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
      expect(component.getStatusLabel("PENDING_APPROVAL")).toBe("Pending");
      expect(component.getStatusLabel("SETTLED")).toBe("Settled");
      expect(component.getStatusLabel("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("Cleanup", () => {
    it("should clear polling interval on destroy", fakeAsync(() => {
      mockAuthService.getFarmerId.and.returnValue(1);
      mockApiService.getFarmer.and.returnValue(of(mockFarmer));
      mockApiService.farmerCredits.and.returnValue(of([mockPendingVoucher]));
      mockApiService.farmerPendingCredits.and.returnValue(
        of([mockPendingVoucher]),
      );

      component.ngOnInit();
      tick();

      const pollTimer = component.pollTimer;
      spyOn(window, "clearInterval");

      component.ngOnDestroy();

      expect(window.clearInterval).toHaveBeenCalledWith(pollTimer);
    }));
  });
});
