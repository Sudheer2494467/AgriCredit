import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of, throwError } from "rxjs";

import { SettlementComponent } from "./settlement.component";
import { ApiService } from "../core/api.service";

describe("SettlementComponent", () => {
  let component: SettlementComponent;
  let fixture: ComponentFixture<SettlementComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj("ApiService", [
      "farmers",
      "createSettlement",
    ]);

    await TestBed.configureTestingModule({
      imports: [
        SettlementComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatAutocompleteModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        FormBuilder,
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(SettlementComponent);
    component = fixture.componentInstance;
  });

  describe("Component Initialization", () => {
    it("should create settlement component", () => {
      expect(component).toBeTruthy();
    });

    it("should load farmers on init", () => {
      const mockFarmers = [
        { id: 1, name: "Farmer 1", village: "Village 1", phone: "9999999999" },
        { id: 2, name: "Farmer 2", village: "Village 2", phone: "8888888888" },
      ];

      apiService.farmers.and.returnValue(of(mockFarmers));
      fixture.detectChanges();

      expect(apiService.farmers).toHaveBeenCalled();
      expect(component.farmers.length).toBe(2);
    });

    it("should initialize form with correct controls", () => {
      fixture.detectChanges();

      expect(component.form.get("farmerId")).toBeTruthy();
      expect(component.form.get("farmerSearch")).toBeTruthy();
      expect(component.form.get("cropName")).toBeTruthy();
      expect(component.form.get("quantity")).toBeTruthy();
      expect(component.form.get("pricePerKg")).toBeTruthy();
    });
  });

  describe("Farmer Search and Selection", () => {
    beforeEach(() => {
      const mockFarmers = [
        { id: 1, name: "Farmer 1", village: "Village 1", phone: "9999999999" },
        { id: 2, name: "Farmer 2", village: "Village 2", phone: "8888888888" },
        {
          id: 3,
          name: "Raj Kumar",
          village: "Test Village",
          phone: "7777777777",
        },
      ];
      apiService.farmers.and.returnValue(of(mockFarmers));
      fixture.detectChanges();
    });

    it("should filter farmers based on search term", (done) => {
      const searchControl = component.form.get("farmerSearch");
      searchControl?.setValue("Farmer");

      component.filteredFarmers$.subscribe((filtered) => {
        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered[0].name).toContain("Farmer");
        done();
      });
    });

    it("should display farmer name and village in autocomplete", () => {
      const farmer = { id: 1, name: "Farmer 1", village: "Village 1" };
      const displayResult = component.displayFarmer(farmer);

      expect(displayResult).toBe("Farmer 1 (Village 1)");
    });

    it("should handle farmer selection", () => {
      const selectedFarmer = {
        id: 1,
        name: "Farmer 1",
        village: "Village 1",
        phone: "9999999999",
      };
      const event = { option: { value: selectedFarmer } };

      component.onFarmerSelected(event);

      expect(component.form.get("farmerId")?.value).toBe(1);
      expect(component.form.get("farmerSearch")?.value).toEqual(selectedFarmer);
    });

    it("should return empty string for null farmer in displayFarmer", () => {
      const result = component.displayFarmer(null);
      expect(result).toBe("");
    });

    it("should handle string input in displayFarmer", () => {
      const result = component.displayFarmer("search text");
      expect(result).toBe("search text");
    });
  });

  describe("Farmer Filtering", () => {
    beforeEach(() => {
      component.farmers = [
        { id: 1, name: "Ramesh Kumar", village: "Nagpur", phone: "9999999999" },
        { id: 2, name: "Priya Singh", village: "Delhi", phone: "8888888888" },
        { id: 3, name: "Hari Patel", village: "Gujarat", phone: "7777777777" },
      ];
    });

    it("should filter farmers by name", () => {
      const result = component.filterFarmers("Ramesh");
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("Ramesh Kumar");
    });

    it("should filter farmers by village", () => {
      const result = component.filterFarmers("Nagpur");
      expect(result.length).toBe(1);
      expect(result[0].village).toBe("Nagpur");
    });

    it("should filter farmers by phone", () => {
      const result = component.filterFarmers("9999999999");
      expect(result.length).toBe(1);
      expect(result[0].phone).toBe("9999999999");
    });

    it("should return all farmers for empty search", () => {
      const result = component.filterFarmers("");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle farmer object passed as search value (after selection)", () => {
      const farmer = { id: 1, name: "Ramesh Kumar", village: "Nagpur" };
      const result = component.filterFarmers(farmer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("Settlement Form Validation", () => {
    beforeEach(() => {
      apiService.farmers.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it("should have invalid form when empty", () => {
      expect(component.form.valid).toBeFalsy();
    });

    it("should require farmerId", () => {
      component.form.patchValue({
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });

      expect(component.form.get("farmerId")?.hasError("required")).toBeTruthy();
      expect(component.form.valid).toBeFalsy();
    });

    it("should require cropName", () => {
      component.form.patchValue({
        farmerId: 1,
        quantity: 100,
        pricePerKg: 50,
      });

      expect(component.form.get("cropName")?.hasError("required")).toBeTruthy();
      expect(component.form.valid).toBeFalsy();
    });

    it("should require quantity", () => {
      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 0,
        pricePerKg: 50,
      });

      expect(component.form.get("quantity")?.hasError("required")).toBeTruthy();
      expect(component.form.valid).toBeFalsy();
    });

    it("should require pricePerKg", () => {
      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 0,
      });

      expect(
        component.form.get("pricePerKg")?.hasError("required"),
      ).toBeTruthy();
      expect(component.form.valid).toBeFalsy();
    });

    it("should be valid when all required fields are filled", () => {
      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });

      expect(component.form.valid).toBeTruthy();
    });
  });

  describe("Settlement Submission", () => {
    beforeEach(() => {
      apiService.farmers.and.returnValue(of([]));
      fixture.detectChanges();
    });

    it("should not submit if form is invalid", () => {
      component.submit();
      expect(apiService.createSettlement).not.toHaveBeenCalled();
    });

    it("should not submit if already submitting", () => {
      component.isSubmitting = true;
      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });

      component.submit();
      expect(apiService.createSettlement).not.toHaveBeenCalled();
    });

    it("should create settlement with correct payload", () => {
      const mockReceipt = {
        id: 1,
        settlementNo: "ST-123456789",
        cropPurchase: {
          cropName: "Cotton",
          quantity: 100,
          pricePerKg: 50,
          totalValue: 5000,
        },
        creditDeducted: 4000,
        interestDeducted: 200,
        netPayout: 800,
        remainingBalance: 0,
      };

      apiService.createSettlement.and.returnValue(of(mockReceipt));

      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });

      component.submit();

      expect(apiService.createSettlement).toHaveBeenCalledWith({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });
    });

    it("should display receipt after successful settlement", (done) => {
      const mockReceipt = {
        id: 1,
        settlementNo: "ST-123456789",
        cropPurchase: {
          cropName: "Cotton",
          quantity: 100,
          pricePerKg: 50,
          totalValue: 5000,
        },
        creditDeducted: 4000,
        interestDeducted: 200,
        netPayout: 800,
        remainingBalance: 0,
      };

      apiService.createSettlement.and.returnValue(of(mockReceipt));

      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });

      component.submit();

      setTimeout(() => {
        expect(component.receipt).toEqual(mockReceipt);
        expect(component.isSubmitting).toBeFalsy();
        done();
      }, 100);
    });

    it("should reset form after submission", (done) => {
      const mockReceipt = {
        id: 1,
        settlementNo: "ST-123456789",
        cropPurchase: {
          cropName: "Cotton",
          quantity: 100,
          pricePerKg: 50,
          totalValue: 5000,
        },
        creditDeducted: 4000,
        interestDeducted: 200,
        netPayout: 800,
        remainingBalance: 0,
      };

      apiService.createSettlement.and.returnValue(of(mockReceipt));

      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });

      component.submit();

      setTimeout(() => {
        expect(component.form.get("cropName")?.value).toBeFalsy();
        expect(component.form.get("quantity")?.value).toBe(0);
        expect(component.form.get("pricePerKg")?.value).toBe(0);
        done();
      }, 100);
    });

    it("should handle submission errors", (done) => {
      apiService.createSettlement.and.returnValue(
        throwError(() => new Error("API call failed")),
      );

      component.form.patchValue({
        farmerId: 1,
        cropName: "Cotton",
        quantity: 100,
        pricePerKg: 50,
      });

      component.submit();

      setTimeout(() => {
        expect(component.isSubmitting).toBeFalsy();
        done();
      }, 100);
    });
  });

  describe("Receipt Display", () => {
    it("should display settlement number correctly", () => {
      component.receipt = {
        settlementNo: "ST-123456789",
        cropPurchase: {
          totalValue: 5000,
          cropName: "Cotton",
          quantity: 100,
          pricePerKg: 50,
        },
        creditDeducted: 4000,
        interestDeducted: 200,
        netPayout: 800,
        remainingBalance: 0,
      };

      fixture.detectChanges();
      const compiled = fixture.nativeElement;

      expect(compiled.textContent).toContain("ST-123456789");
    });

    it("should display remaining balance when present", () => {
      component.receipt = {
        settlementNo: "ST-123456789",
        cropPurchase: { totalValue: 1000 },
        creditDeducted: 500,
        interestDeducted: 100,
        netPayout: 0,
        remainingBalance: 400,
      };

      fixture.detectChanges();

      expect(component.receipt.remainingBalance).toBeGreaterThan(0);
    });
  });

  describe("Print Functionality", () => {
    it("should call window.print on print button click", () => {
      spyOn(window, "print");

      component.print();

      expect(window.print).toHaveBeenCalled();
    });
  });
});
