import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { NgFor, NgIf, DecimalPipe, AsyncPipe } from "@angular/common";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ApiService } from "../core/api.service";

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    NgFor,
    NgIf,
    DecimalPipe,
    AsyncPipe,
  ],
  template: `
    <h2 class="page-title">Credit Entry</h2>

    <!-- Approval State Overlay -->
    <div
      *ngIf="approvalState === 'pending'"
      class="approval-overlay glass-card"
    >
      <div class="approval-icon"><mat-icon>hourglass_top</mat-icon></div>
      <div class="approval-title">Waiting for Farmer Approval</div>
      <div class="approval-sub">
        Voucher <strong>{{ pendingVoucher?.voucherNo }}</strong> has been sent
        to the farmer.
      </div>
      <div class="approval-sub">
        Amount: <strong>₹{{ totalCredit | number: "1.2-2" }}</strong>
      </div>
      <div class="poll-indicator">
        <div class="poll-dot"></div>
        <span>Polling for approval every 5 seconds...</span>
      </div>
      <button mat-stroked-button (click)="cancelApproval()" class="cancel-btn">
        Cancel
      </button>
    </div>

    <div
      *ngIf="approvalState === 'approved'"
      class="approved-banner glass-card"
    >
      <mat-icon>check_circle</mat-icon>
      <div>
        <strong>✅ Farmer Approved!</strong>
        <span
          >Voucher {{ pendingVoucher?.voucherNo }} approved. Click below to
          finalize.</span
        >
      </div>
      <button
        mat-raised-button
        color="primary"
        (click)="finalizeVoucher()"
        class="finalize-btn"
      >
        <mat-icon>save</mat-icon> Finalize Voucher
      </button>
    </div>

    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      *ngIf="approvalState === 'none'"
    >
      <!-- Farmer Selection -->
      <div class="farmer-select-card glass-card">
        <div class="form-card-header">
          <mat-icon>person</mat-icon>
          <span>Select Farmer</span>
        </div>
        <div class="farmer-select-body">
          <mat-form-field appearance="outline" class="w-full">
            <input
              type="text"
              matInput
              formControlName="farmerSearch"
              [matAutocomplete]="auto"
              placeholder="Search farmer by name or phone..."
            />
            <mat-autocomplete
              #auto="matAutocomplete"
              [displayWith]="displayFarmer"
              (optionSelected)="onFarmer($event.option.value)"
            >
              <mat-option *ngFor="let f of filteredFarmers | async" [value]="f">
                {{ f.name }} ({{ f.village }} - {{ f.phone }})
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>
          <div *ngIf="selectedFarmer" class="farmer-info-bar">
            <div class="info-chip">
              <mat-icon>account_balance_wallet</mat-icon>
              Balance: ₹{{ selectedFarmer.currentBalance | number: "1.2-2" }}
            </div>
            <div class="info-chip">
              <mat-icon>landscape</mat-icon>
              {{ selectedFarmer.landAcres }} acres
            </div>
          </div>
        </div>
      </div>

      <!-- Line Items -->
      <div class="items-card glass-card">
        <div class="form-card-header">
          <mat-icon>receipt_long</mat-icon>
          <span>Credit Items</span>
          <span class="item-count">{{ items.length }} items</span>
          <button
            mat-button
            type="button"
            (click)="addRow()"
            class="add-row-btn"
          >
            <mat-icon>add_circle</mat-icon> Add Item
          </button>
        </div>
        <div class="items-list" formArrayName="items">
          <div
            *ngFor="let item of items.controls; let i = index"
            [formGroupName]="i"
            class="item-row"
          >
            <div class="item-number">{{ i + 1 }}</div>
            <div class="item-field type-field">
              <label class="field-label">Type</label>
              <mat-form-field appearance="outline">
                <mat-select
                  formControlName="type"
                  (selectionChange)="onTypeChange(i)"
                  placeholder="Select type"
                >
                  <mat-option value="">-- Select Type --</mat-option>
                  <mat-option value="PRODUCT">Product</mat-option>
                  <mat-option value="CASH">Cash</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            <ng-container *ngIf="getType(i) === 'PRODUCT'">
              <div class="item-field">
                <label class="field-label">Category</label>
                <mat-form-field appearance="outline">
                  <mat-select
                    formControlName="categoryId"
                    (selectionChange)="onCategoryChange(i, $event.value)"
                    placeholder="Select"
                  >
                    <mat-option *ngFor="let c of categories" [value]="c.id">{{
                      c.name
                    }}</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="item-field">
                <label class="field-label">Product</label>
                <mat-form-field appearance="outline">
                  <mat-select
                    formControlName="productId"
                    (selectionChange)="onProduct(i, $event.value)"
                    placeholder="Select"
                  >
                    <mat-option
                      *ngFor="let p of getFilteredProducts(i)"
                      [value]="p.id"
                      >{{ p.name }} (₹{{ p.pricePerUnit }})</mat-option
                    >
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="item-field small-field">
                <label class="field-label">Qty</label>
                <mat-form-field appearance="outline">
                  <input
                    matInput
                    type="number"
                    formControlName="quantity"
                    (input)="totals()"
                    min="1"
                    placeholder="1"
                  />
                </mat-form-field>
              </div>
              <div class="item-field small-field">
                <label class="field-label">Price (₹)</label>
                <mat-form-field appearance="outline">
                  <input
                    matInput
                    type="number"
                    formControlName="price"
                    (input)="totals()"
                    placeholder="0"
                  />
                </mat-form-field>
              </div>
            </ng-container>
            <ng-container *ngIf="getType(i) === 'CASH'">
              <div class="item-field cash-field">
                <label class="field-label">Cash Amount (₹)</label>
                <mat-form-field appearance="outline">
                  <input
                    matInput
                    type="number"
                    formControlName="price"
                    (input)="onCashAmountChange(i)"
                    placeholder="Enter cash amount"
                  />
                </mat-form-field>
              </div>
            </ng-container>
            <ng-container *ngIf="!getType(i)">
              <div class="item-field select-msg">
                <span class="hint-text">← Please select a type first</span>
              </div>
            </ng-container>
            <div class="item-total">
              <span class="total-label">Total</span>
              <span class="total-value"
                >₹{{ lineTotal(i) | number: "1.2-2" }}</span
              >
            </div>
            <button
              mat-icon-button
              type="button"
              (click)="remove(i)"
              class="remove-btn"
              *ngIf="items.length > 1"
            >
              <mat-icon>delete_outline</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="summary-card glass-card">
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Product Amount</span>
            <span class="summary-value"
              >₹{{ totalProduct | number: "1.2-2" }}</span
            >
          </div>
          <div class="summary-item">
            <span class="summary-label">Cash Amount</span>
            <span class="summary-value"
              >₹{{ totalCash | number: "1.2-2" }}</span
            >
          </div>
          <div class="summary-item total">
            <span class="summary-label">Total Credit</span>
            <span class="summary-value highlight"
              >₹{{ totalCredit | number: "1.2-2" }}</span
            >
          </div>
          <div class="summary-item" *ngIf="selectedFarmer">
            <span class="summary-label">New Balance</span>
            <span class="summary-value warning"
              >₹{{
                (selectedFarmer.currentBalance || 0) + totalCredit
                  | number: "1.2-2"
              }}</span
            >
          </div>
        </div>

        <div class="form-actions">
          <button
            mat-raised-button
            type="button"
            [disabled]="!canSubmit()"
            class="approval-btn"
            (click)="sendForApproval()"
          >
            <mat-icon>send</mat-icon>
            Send for Farmer Approval
          </button>
          <button
            mat-raised-button
            type="submit"
            [disabled]="!canSubmit()"
            class="save-btn"
          >
            <mat-icon>save</mat-icon>
            Save Directly (No Approval)
          </button>
        </div>

        <div *ngIf="successMsg" class="success-msg">
          <mat-icon>check_circle</mat-icon>
          {{ successMsg }}
        </div>
        <div *ngIf="errorMsg" class="error-msg">
          <mat-icon>error_outline</mat-icon>
          {{ errorMsg }}
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      .farmer-select-card,
      .items-card,
      .summary-card {
        overflow: hidden;
        margin-bottom: 20px;
      }
      .form-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 20px;
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
      .item-count {
        font-size: 11px;
        padding: 2px 10px;
        border-radius: var(--radius-full);
        background: var(--clr-primary-glow);
        color: var(--clr-primary-light);
        font-weight: 600;
      }
      .add-row-btn {
        margin-left: auto !important;
        color: var(--clr-primary-light) !important;
        font-size: 12px;
      }
      .farmer-select-body {
        padding: 20px;
      }
      .farmer-info-bar {
        display: flex;
        gap: 16px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .info-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        background: var(--clr-surface-alt);
        font-size: 12px;
        color: var(--clr-text-secondary);
        font-weight: 500;
      }
      .info-chip mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--clr-primary-light);
      }
      .items-list {
        padding: 16px 20px;
      }
      .item-row {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        padding: 16px;
        margin-bottom: 12px;
        background: var(--clr-surface-alt);
        border-radius: var(--radius-md);
        border: 1px solid var(--clr-border);
        flex-wrap: wrap;
      }
      .item-number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--clr-primary-glow);
        color: var(--clr-primary-light);
        display: grid;
        place-items: center;
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
        margin-bottom: 16px;
      }
      .item-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .type-field {
        min-width: 130px;
      }
      .small-field {
        min-width: 80px;
        max-width: 100px;
      }
      .cash-field {
        flex: 1;
        min-width: 200px;
      }
      .select-msg {
        flex: 1;
        margin-bottom: 16px;
      }
      .hint-text {
        font-size: 12px;
        color: var(--clr-text-muted);
        font-style: italic;
      }
      .field-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--clr-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .item-total {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
        margin-left: auto;
        margin-bottom: 16px;
        min-width: 80px;
      }
      .total-label {
        font-size: 10px;
        color: var(--clr-text-muted);
        text-transform: uppercase;
        font-weight: 600;
      }
      .total-value {
        font-size: 16px;
        font-weight: 700;
        color: var(--clr-primary-light);
      }
      .remove-btn {
        color: var(--clr-danger) !important;
        width: 32px !important;
        height: 32px !important;
        margin-bottom: 12px;
      }
      .summary-card {
        padding: 24px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }
      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 16px;
        background: var(--clr-surface-alt);
        border-radius: var(--radius-md);
        border: 1px solid var(--clr-border);
      }
      .summary-item.total {
        border-color: var(--clr-primary);
        background: rgba(99, 102, 241, 0.08);
      }
      .summary-label {
        font-size: 11px;
        color: var(--clr-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }
      .summary-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--clr-text);
      }
      .summary-value.highlight {
        color: var(--clr-primary-light);
      }
      .summary-value.warning {
        color: var(--clr-warning);
      }
      .form-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 8px;
      }
      .approval-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706) !important;
        color: white !important;
        height: 48px;
        font-size: 14px;
        flex: 1;
      }
      .save-btn {
        background: var(--grad-primary) !important;
        color: white !important;
        height: 48px;
        font-size: 14px;
        flex: 1;
      }
      .success-msg {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 12px 16px;
        background: var(--clr-success-soft);
        color: var(--clr-success);
        border-radius: var(--radius-sm);
        font-size: 13px;
        font-weight: 500;
      }
      .error-msg {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        padding: 12px 16px;
        background: var(--clr-danger-soft);
        color: var(--clr-danger);
        border-radius: var(--radius-sm);
        font-size: 13px;
        font-weight: 500;
      }

      /* Approval Overlay */
      .approval-overlay {
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
        border: 2px solid var(--clr-warning);
        background: rgba(245, 158, 11, 0.05);
        margin-bottom: 20px;
      }
      .approval-icon {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--clr-warning-soft);
        display: grid;
        place-items: center;
      }
      .approval-icon mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--clr-warning);
        animation: pulse-spin 2s linear infinite;
      }
      @keyframes pulse-spin {
        0%,
        100% {
          transform: rotate(0deg);
        }
        50% {
          transform: rotate(180deg);
        }
      }
      .approval-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--clr-text);
      }
      .approval-sub {
        font-size: 14px;
        color: var(--clr-text-secondary);
      }
      .poll-indicator {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
      }
      .poll-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--clr-warning);
        animation: blink 1s ease-in-out infinite;
      }
      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.2;
        }
      }
      .cancel-btn {
        color: var(--clr-text-muted) !important;
        border-color: var(--clr-border) !important;
      }

      .approved-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        border: 2px solid var(--clr-success);
        background: rgba(34, 197, 94, 0.05);
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .approved-banner mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: var(--clr-success);
        flex-shrink: 0;
      }
      .approved-banner div {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
      }
      .approved-banner strong {
        font-size: 16px;
        color: var(--clr-success);
      }
      .approved-banner span {
        font-size: 13px;
        color: var(--clr-text-muted);
      }
      .finalize-btn {
        background: linear-gradient(135deg, #22c55e, #16a34a) !important;
        color: white !important;
        height: 48px;
        white-space: nowrap;
      }
    `,
  ],
})
export class CreditEntryComponent implements OnInit, OnDestroy {
  farmers: any[] = [];
  categories: any[] = [];
  products: any[] = [];
  selectedFarmer: any;
  totalProduct = 0;
  totalCash = 0;
  totalCredit = 0;
  successMsg = "";
  errorMsg = "";

  approvalState: "none" | "pending" | "approved" = "none";
  pendingVoucher: any = null;
  public pollTimer: any;

  form = this.fb.group({
    farmerId: [null as number | null, Validators.required],
    farmerSearch: [""],
    items: this.fb.array([]),
  });

  filteredFarmers!: Observable<any[]>;
  get items(): FormArray {
    return this.form.get("items") as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    this.api.farmers().subscribe((r) => {
      this.farmers = r;
      this.setupFarmerSearch();
    });
    this.api.categories().subscribe((r) => (this.categories = r));
    this.api.products().subscribe((r) => (this.products = r));
    this.addRow();
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  setupFarmerSearch() {
    this.filteredFarmers = this.form.get("farmerSearch")!.valueChanges.pipe(
      startWith(""),
      map((value) => {
        const name = typeof value === "string" ? value : (value as any)?.name;
        return name
          ? this._filterFarmers(name as string)
          : this.farmers.slice();
      }),
    );
  }

  private _filterFarmers(name: string): any[] {
    const f = name.toLowerCase();
    return this.farmers.filter(
      (x) =>
        x.name.toLowerCase().includes(f) || (x.phone && x.phone.includes(f)),
    );
  }

  displayFarmer(farmer: any): string {
    return farmer && farmer.name ? `${farmer.name} (${farmer.village})` : "";
  }

  addRow() {
    this.items.push(
      this.fb.group({
        type: [""],
        categoryId: [null],
        productId: [null],
        quantity: [1],
        price: [0],
      }),
    );
  }

  remove(i: number) {
    this.items.removeAt(i);
    this.totals();
  }
  getType(i: number): string {
    return this.items.at(i).get("type")?.value || "";
  }

  onTypeChange(i: number) {
    const type = this.getType(i);
    const group = this.items.at(i) as FormGroup;
    if (type === "CASH")
      group.patchValue({
        categoryId: null,
        productId: null,
        quantity: 1,
        price: 0,
      });
    else if (type === "PRODUCT") group.patchValue({ price: 0, quantity: 1 });
    this.totals();
  }

  onCashAmountChange(i: number) {
    (this.items.at(i) as FormGroup).patchValue({ quantity: 1 });
    this.totals();
  }
  onCategoryChange(i: number, _catId: number) {
    (this.items.at(i) as FormGroup).patchValue({ productId: null, price: 0 });
  }

  getFilteredProducts(i: number): any[] {
    const catId = this.items.at(i).get("categoryId")?.value;
    return catId
      ? this.products.filter((p) => p.category?.id === catId)
      : this.products;
  }

  onFarmer(farmer: any) {
    this.selectedFarmer = farmer;
    this.form.patchValue({ farmerId: farmer.id });
  }

  onProduct(i: number, productId: number) {
    const product = this.products.find((p) => p.id === productId);
    if (product)
      this.items
        .at(i)
        .patchValue({
          price: product.pricePerUnit || 0,
          categoryId: product.category?.id || null,
        });
    this.totals();
  }

  lineTotal(i: number): number {
    const v = this.items.at(i).value;
    return (v.quantity || 0) * (v.price || 0);
  }

  totals() {
    this.totalProduct = 0;
    this.totalCash = 0;
    this.items.controls.forEach((c) => {
      const v: any = c.value;
      const t = (v.quantity || 0) * (v.price || 0);
      if (v.type === "PRODUCT") this.totalProduct += t;
      else if (v.type === "CASH") this.totalCash += t;
    });
    this.totalCredit = this.totalProduct + this.totalCash;
  }

  canSubmit(): boolean {
    if (!this.form.get("farmerId")?.value || this.items.length === 0)
      return false;
    for (const ctrl of this.items.controls) {
      const v: any = ctrl.value;
      if (!v.type) return false;
      if (v.type === "PRODUCT" && !v.productId) return false;
      if (v.type === "CASH" && (!v.price || v.price <= 0)) return false;
    }
    return true;
  }

  buildPayload(pending: boolean) {
    return {
      farmerId: this.form.get("farmerId")?.value,
      pendingApproval: pending,
      items: this.items.controls.map((ctrl) => {
        const v: any = ctrl.value;
        return {
          type: v.type,
          categoryId: v.type === "PRODUCT" ? v.categoryId : null,
          productId: v.type === "PRODUCT" ? v.productId : null,
          quantity: v.type === "CASH" ? 1 : v.quantity || 1,
          price: v.price || 0,
        };
      }),
    };
  }

  sendForApproval() {
    this.errorMsg = "";
    this.api.createCredit(this.buildPayload(true)).subscribe({
      next: (res: any) => {
        this.pendingVoucher = res;
        this.approvalState = "pending";
        this.startPolling(this.form.get("farmerId")?.value as number);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || "Failed to send for approval.";
      },
    });
  }

  startPolling(farmerId: number) {
    this.pollTimer = setInterval(() => {
      this.api.farmerPendingCredits(farmerId).subscribe((pending) => {
        const stillPending = pending.find(
          (v: any) => v.id === this.pendingVoucher?.id,
        );
        if (!stillPending) {
          clearInterval(this.pollTimer);
          this.approvalState = "approved";
        }
      });
    }, 5000);
  }

  cancelApproval() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.approvalState = "none";
    this.pendingVoucher = null;
  }

  finalizeVoucher() {
    this.successMsg = `Voucher ${this.pendingVoucher?.voucherNo} confirmed! Total: ₹${this.totalCredit.toFixed(2)}`;
    this.resetForm();
    this.approvalState = "none";
    this.pendingVoucher = null;
    this.api.farmers().subscribe((r) => (this.farmers = r));
  }

  submit() {
    this.successMsg = "";
    this.errorMsg = "";
    this.api.createCredit(this.buildPayload(false)).subscribe({
      next: (res: any) => {
        this.successMsg = `Voucher ${res.voucherNo || ""} saved! Total: ₹${this.totalCredit.toFixed(2)}`;
        this.resetForm();
        this.api.farmers().subscribe((r) => (this.farmers = r));
      },
      error: (err) => {
        this.errorMsg =
          err.error?.message || err.error?.error || "Failed to save voucher.";
      },
    });
  }

  resetForm() {
    this.form.patchValue({ farmerId: null, farmerSearch: "" });
    this.items.clear();
    this.addRow();
    this.totalCash = this.totalProduct = this.totalCredit = 0;
    this.selectedFarmer = null;
  }
}
