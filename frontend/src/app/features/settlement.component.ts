import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatOptionModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { ApiService } from "../core/api.service";
import { AsyncPipe, CommonModule, DecimalPipe } from "@angular/common";
import { map, startWith } from "rxjs/operators";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    AsyncPipe,
    DecimalPipe,
  ],
  template: `
    <h2 class="page-title">Crop Purchase & Settlement</h2>

    <div class="settlement-layout">
      <!-- Form -->
      <div class="form-card glass-card">
        <div class="form-card-header">
          <mat-icon>handshake</mat-icon>
          <span>New Settlement</span>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="settlement-form">
          <div class="field-group">
            <label class="field-label">Search & Select Farmer</label>
            <mat-form-field appearance="outline">
              <mat-label>Enter farmer name</mat-label>
              <input
                matInput
                formControlName="farmerSearch"
                [matAutocomplete]="auto"
                placeholder="Type farmer name..."
              />
              <mat-autocomplete
                #auto="matAutocomplete"
                [displayWith]="displayFarmer"
                (optionSelected)="onFarmerSelected($event)"
              >
                <mat-option
                  *ngFor="let farmer of filteredFarmers$ | async"
                  [value]="farmer"
                >
                  {{ farmer.name }} ({{ farmer.village }})
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
          </div>
          <div class="field-group">
            <label class="field-label">Crop Name</label>
            <mat-form-field appearance="outline">
              <input
                matInput
                formControlName="cropName"
                placeholder="e.g. Cotton, Soybean"
              />
            </mat-form-field>
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Quantity (Kg)</label>
              <mat-form-field appearance="outline">
                <input
                  matInput
                  type="number"
                  formControlName="quantity"
                  placeholder="0"
                />
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Price / Kg (₹)</label>
              <mat-form-field appearance="outline">
                <input
                  matInput
                  type="number"
                  formControlName="pricePerKg"
                  placeholder="0"
                />
              </mat-form-field>
            </div>
          </div>
          <button
            mat-raised-button
            color="primary"
            [disabled]="form.invalid || isSubmitting"
            class="settle-btn"
          >
            <mat-icon *ngIf="!isSubmitting">check_circle</mat-icon>
            <mat-icon *ngIf="isSubmitting">hourglass_empty</mat-icon>
            {{ isSubmitting ? "Processing..." : "Create Settlement" }}
          </button>
        </form>
      </div>

      <!-- Receipt -->
      <div *ngIf="receipt" class="receipt-card glass-card">
        <div class="receipt-header">
          <div class="receipt-badge">
            <mat-icon>receipt</mat-icon>
          </div>
          <div>
            <h3 class="receipt-title">Settlement Receipt</h3>
            <span class="receipt-no">{{ receipt.settlementNo }}</span>
          </div>
        </div>

        <div class="receipt-body">
          <div class="receipt-row">
            <span class="receipt-label">Crop Value</span>
            <span class="receipt-value"
              >₹{{ receipt.cropPurchase?.totalValue | number: "1.2-2" }}</span
            >
          </div>
          <div class="receipt-divider"></div>
          <div class="receipt-row deduction">
            <span class="receipt-label">Credit Deducted</span>
            <span class="receipt-value"
              >- ₹{{ receipt.creditDeducted | number: "1.2-2" }}</span
            >
          </div>
          <div class="receipt-row deduction">
            <span class="receipt-label">Interest Deducted</span>
            <span class="receipt-value"
              >- ₹{{ receipt.interestDeducted | number: "1.2-2" }}</span
            >
          </div>
          <div class="receipt-divider"></div>
          <div class="receipt-row payout">
            <span class="receipt-label">Final Payout</span>
            <span class="receipt-value payout-value"
              >₹{{ receipt.netPayout | number: "1.2-2" }}</span
            >
          </div>
          <div
            *ngIf="receipt.remainingBalance && receipt.remainingBalance > 0"
            class="receipt-row remaining"
          >
            <span class="receipt-label">Remaining Balance Due</span>
            <span class="receipt-value remaining-value"
              >₹{{ receipt.remainingBalance | number: "1.2-2" }}</span
            >
          </div>
        </div>

        <button mat-raised-button (click)="print()" class="print-btn">
          <mat-icon>print</mat-icon>
          Print Receipt
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .settlement-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        align-items: start;
      }

      @media (max-width: 900px) {
        .settlement-layout {
          grid-template-columns: 1fr;
        }
      }

      .form-card,
      .receipt-card {
        overflow: hidden;
      }

      .form-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 24px;
        border-bottom: 1px solid var(--clr-border);
        font-size: 14px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .form-card-header mat-icon {
        color: var(--clr-primary-light);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .settlement-form {
        padding: 24px;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
      }

      .field-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--clr-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      @media (max-width: 600px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }

      .settle-btn {
        background: var(--grad-primary) !important;
        color: white !important;
        width: 100%;
        height: 48px;
        font-size: 14px;
        margin-top: 8px;
      }

      .settle-btn mat-icon {
        margin-right: 4px;
      }

      /* Receipt */
      .receipt-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        border-bottom: 1px solid var(--clr-border);
      }

      .receipt-badge {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        background: var(--clr-success-soft);
        display: grid;
        place-items: center;
      }

      .receipt-badge mat-icon {
        color: var(--clr-success);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .receipt-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--clr-text);
      }

      .receipt-no {
        font-size: 12px;
        color: var(--clr-text-muted);
        font-family: "SF Mono", monospace;
      }

      .receipt-body {
        padding: 24px;
      }

      .receipt-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
      }

      .receipt-label {
        font-size: 13px;
        color: var(--clr-text-secondary);
      }

      .receipt-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .receipt-row.deduction .receipt-value {
        color: var(--clr-danger);
      }

      .receipt-row.payout {
        padding-top: 12px;
      }

      .payout-value {
        font-size: 22px !important;
        font-weight: 800 !important;
        color: var(--clr-success) !important;
      }

      .receipt-row.remaining {
        padding-top: 12px;
        border-top: 1px solid var(--clr-warning-soft);
      }

      .remaining-value {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--clr-warning) !important;
      }

      .receipt-divider {
        height: 1px;
        background: var(--clr-border);
        margin: 4px 0;
      }

      .print-btn {
        margin: 0 24px 24px;
        width: calc(100% - 48px);
        background: var(--clr-surface-alt) !important;
        color: var(--clr-text) !important;
        border: 1px solid var(--clr-border) !important;
      }

      .print-btn mat-icon {
        margin-right: 4px;
      }
    `,
  ],
})
export class SettlementComponent implements OnInit {
  farmers: any[] = [];
  filteredFarmers$: any;
  receipt: any;
  isSubmitting = false;

  form = this.fb.group({
    farmerId: [null, Validators.required],
    farmerSearch: [""],
    cropName: ["", Validators.required],
    quantity: [0, Validators.required],
    pricePerKg: [0, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.api.farmers().subscribe((r) => {
      this.farmers = r;
      this.setupAutocomplete();
    });
  }

  setupAutocomplete() {
    this.filteredFarmers$ = this.form.get("farmerSearch")!.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterFarmers(value ?? "")),
    );
  }

  filterFarmers(searchValue: any) {
    // When autocomplete selects, the value is the farmer object, not a string
    if (typeof searchValue === "object" && searchValue !== null) {
      return this.farmers.slice(0, 20);
    }
    const searchTerm = (searchValue || "").toString().toLowerCase();

    if (!searchTerm) {
      return this.farmers.slice(0, 20);
    }

    const filtered = this.farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(searchTerm) ||
        f.village.toLowerCase().includes(searchTerm) ||
        (f.phone && f.phone.includes(searchTerm)),
    );

    return filtered.slice(0, 20);
  }

  displayFarmer = (farmer: any): string => {
    if (!farmer) return "";
    if (typeof farmer === "string") return farmer;
    if (farmer && farmer.name) {
      return farmer.village
        ? `${farmer.name} (${farmer.village})`
        : farmer.name;
    }
    return "";
  };

  onFarmerSelected(event: any) {
    const farmer = event.option.value;
    if (farmer && farmer.id) {
      this.form.patchValue({
        farmerId: farmer.id,
        farmerSearch: farmer,
      });
    }
  }

  submit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const request = {
      farmerId: this.form.get("farmerId")?.value,
      cropName: this.form.get("cropName")?.value,
      quantity: this.form.get("quantity")?.value,
      pricePerKg: this.form.get("pricePerKg")?.value,
    };

    this.api.createSettlement(request).subscribe({
      next: (r) => {
        this.receipt = r;
        this.isSubmitting = false;
        this.form.reset({ quantity: 0, pricePerKg: 0 });
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  print() {
    window.print();
  }
}
