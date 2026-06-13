import { Component, OnInit } from "@angular/core";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../core/api.service";

@Component({
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
  ],
  template: `
    <h2 class="page-title">Stock Management</h2>

    <!-- Category Filter -->
    <div class="filter-bar glass-card">
      <div class="filter-header">
        <mat-icon>filter_list</mat-icon>
        <span>Filter by Category</span>
      </div>
      <div class="category-tabs">
        <button
          class="cat-tab"
          [class.active]="selectedCategoryId === null"
          (click)="selectCategory(null)"
        >
          All Categories
          <span class="cat-count">{{ allStock.length }}</span>
        </button>
        <button
          class="cat-tab"
          *ngFor="let cat of categories"
          [class.active]="selectedCategoryId === cat.id"
          (click)="selectCategory(cat.id)"
        >
          {{ cat.name }}
          <span class="cat-count">{{ getCategoryCount(cat.id) }}</span>
        </button>
      </div>
    </div>

    <!-- Stock by Category -->
    <ng-container *ngIf="filteredStock.length > 0; else emptyStock">
      <div *ngFor="let group of groupedStock" class="category-section">
        <div class="category-header">
          <span class="cat-label">{{ group.categoryName }}</span>
          <span class="cat-badge">{{ group.items.length }} products</span>
        </div>
        <div class="stock-grid">
          <div *ngFor="let s of group.items" class="stock-card glass-card">
            <div class="stock-card-top">
              <div class="product-info">
                <span class="product-name">{{ s.product.name }}</span>
                <span class="product-meta"
                  >{{ s.product.unit }} · ₹{{
                    s.product.pricePerUnit
                  }}/unit</span
                >
              </div>
              <div class="stock-value">
                ₹{{ s.quantity * s.product.pricePerUnit | number: "1.0-0" }}
              </div>
            </div>

            <!-- Quantity Bar -->
            <div class="qty-section">
              <div class="qty-header">
                <span class="qty-label">Stock Level</span>
                <span
                  class="qty-value"
                  [class.low]="s.quantity < 20"
                  [class.medium]="s.quantity >= 20 && s.quantity < 50"
                  [class.high]="s.quantity >= 50"
                >
                  {{ s.quantity }} {{ s.product.unit }}s
                </span>
              </div>
              <div class="qty-bar-bg">
                <div
                  class="qty-bar"
                  [style.width.%]="getQtyPercent(s.quantity)"
                  [class.low]="s.quantity < 20"
                  [class.medium]="s.quantity >= 20 && s.quantity < 50"
                  [class.high]="s.quantity >= 50"
                ></div>
              </div>
            </div>

            <!-- Stock In Action -->
            <div class="stock-in-row">
              <input
                type="number"
                class="qty-input"
                [(ngModel)]="stockInQty[s.id]"
                placeholder="Qty"
                min="1"
              />
              <button
                mat-raised-button
                color="primary"
                class="stock-in-btn"
                (click)="inStock(s.id)"
                [disabled]="!stockInQty[s.id] || stockInQty[s.id] <= 0"
              >
                <mat-icon>add</mat-icon>
                Stock In
              </button>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #emptyStock>
      <div class="empty-state glass-card">
        <span class="empty-icon">📦</span>
        <span class="empty-title">No stock items found</span>
        <span class="empty-desc" *ngIf="selectedCategoryId"
          >No products in this category. Try another category.</span
        >
        <span class="empty-desc" *ngIf="!selectedCategoryId"
          >Add products first, then manage stock here.</span
        >
      </div>
    </ng-template>
  `,
  styles: [
    `
      /* Filter Bar */
      .filter-bar {
        margin-bottom: 24px;
        overflow: hidden;
      }

      .filter-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 20px;
        border-bottom: 1px solid var(--clr-border);
        font-size: 13px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .filter-header mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--clr-primary-light);
      }

      .category-tabs {
        display: flex;
        gap: 8px;
        padding: 14px 20px;
        overflow-x: auto;
        flex-wrap: wrap;
      }

      .cat-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: var(--radius-full);
        border: 1px solid var(--clr-border);
        background: transparent;
        color: var(--clr-text-secondary);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-out);
        font-family: inherit;
        white-space: nowrap;
      }

      .cat-tab:hover {
        background: rgba(99, 102, 241, 0.08);
        border-color: rgba(99, 102, 241, 0.3);
        color: var(--clr-text);
      }

      .cat-tab.active {
        background: rgba(99, 102, 241, 0.15);
        border-color: var(--clr-primary);
        color: var(--clr-primary-light);
      }

      .cat-count {
        padding: 1px 6px;
        border-radius: var(--radius-full);
        background: rgba(255, 255, 255, 0.08);
        font-size: 10px;
        font-weight: 700;
      }

      .cat-tab.active .cat-count {
        background: rgba(99, 102, 241, 0.3);
      }

      /* Category Section */
      .category-section {
        margin-bottom: 28px;
      }

      .category-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
      }

      .cat-label {
        font-size: 16px;
        font-weight: 700;
        color: var(--clr-text);
      }

      .cat-badge {
        font-size: 11px;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        background: var(--clr-accent-glow);
        color: var(--clr-accent-light);
        font-weight: 600;
      }

      /* Stock Grid */
      .stock-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      .stock-card {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .stock-card-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .product-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .product-name {
        font-size: 15px;
        font-weight: 700;
        color: var(--clr-text);
      }

      .product-meta {
        font-size: 12px;
        color: var(--clr-text-muted);
      }

      .stock-value {
        font-size: 14px;
        font-weight: 700;
        color: var(--clr-success);
        padding: 4px 12px;
        background: var(--clr-success-soft);
        border-radius: var(--radius-full);
      }

      /* Quantity */
      .qty-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .qty-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .qty-label {
        font-size: 11px;
        color: var(--clr-text-muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .qty-value {
        font-size: 14px;
        font-weight: 700;
      }

      .qty-value.low {
        color: var(--clr-danger);
      }
      .qty-value.medium {
        color: var(--clr-warning);
      }
      .qty-value.high {
        color: var(--clr-success);
      }

      .qty-bar-bg {
        width: 100%;
        height: 6px;
        background: var(--clr-surface-alt);
        border-radius: 3px;
        overflow: hidden;
      }

      .qty-bar {
        height: 100%;
        border-radius: 3px;
        transition: width 0.5s var(--ease-out);
      }

      .qty-bar.low {
        background: var(--clr-danger);
      }
      .qty-bar.medium {
        background: var(--clr-warning);
      }
      .qty-bar.high {
        background: var(--clr-success);
      }

      /* Stock In */
      .stock-in-row {
        display: flex;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--clr-border);
        align-items: stretch;
        margin-top: auto;
      }

      .qty-input {
        flex: 1;
        min-width: 0;
        height: 40px;
        padding: 0 12px;
        border-radius: 6px;
        border: 1px solid var(--clr-border);
        background: var(--clr-surface-alt);
        color: var(--clr-text);
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .qty-input:focus {
        border-color: var(--clr-primary);
      }

      .qty-input::placeholder {
        color: var(--clr-text-muted);
      }

      .stock-in-btn {
        background: var(--clr-success) !important;
        color: white !important;
        height: 40px !important;
        line-height: 40px !important;
        min-width: auto !important;
        padding: 0 16px !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        border-radius: 6px !important;
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }

      .stock-in-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        text-align: center;
      }

      .empty-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }
      .empty-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--clr-text);
        margin-bottom: 4px;
      }
      .empty-desc {
        font-size: 13px;
        color: var(--clr-text-muted);
      }
    `,
  ],
})
export class StockComponent implements OnInit {
  allStock: any[] = [];
  filteredStock: any[] = [];
  groupedStock: { categoryName: string; items: any[] }[] = [];
  categories: any[] = [];
  selectedCategoryId: number | null = null;
  stockInQty: { [id: number]: number } = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.api.categories().subscribe((c) => (this.categories = c));
    this.api.stock().subscribe((s) => {
      this.allStock = s;
      this.applyFilter();
    });
  }

  selectCategory(catId: number | null) {
    this.selectedCategoryId = catId;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedCategoryId === null) {
      this.filteredStock = [...this.allStock];
    } else {
      this.filteredStock = this.allStock.filter(
        (s) => s.product?.category?.id === this.selectedCategoryId,
      );
    }
    this.buildGroups();
  }

  buildGroups() {
    const map = new Map<string, any[]>();
    for (const s of this.filteredStock) {
      const catName = s.product?.category?.name || "Uncategorized";
      if (!map.has(catName)) map.set(catName, []);
      map.get(catName)!.push(s);
    }
    this.groupedStock = Array.from(map.entries()).map(
      ([categoryName, items]) => ({ categoryName, items }),
    );
  }

  getCategoryCount(catId: number): number {
    return this.allStock.filter((s) => s.product?.category?.id === catId)
      .length;
  }

  inStock(id: number) {
    const qty = this.stockInQty[id];
    if (!qty || qty <= 0) return;
    this.api.stockIn(id, qty).subscribe(() => {
      this.stockInQty[id] = 0;
      this.load();
    });
  }

  getQtyPercent(qty: number): number {
    return Math.min((qty / 150) * 100, 100);
  }
}
