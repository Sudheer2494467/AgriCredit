import { Component, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ApiService } from "../core/api.service";

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    RouterLink,
  ],
  template: `
    <h2 class="page-title">Reports & Export</h2>
    <p class="page-subtitle">Download your shop data and audit logs</p>

    <div class="reports-grid">
      <!-- Dashboard -->
      <a routerLink="/admindashboard" class="report-card glass-card">
        <div
          class="report-icon-wrap"
          style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05));"
        >
          <mat-icon style="color: var(--clr-primary-light);"
            >dashboard</mat-icon
          >
        </div>
        <div class="report-info">
          <h3>Dashboard Metrics</h3>
          <p>
            Overview of farmers, outstanding credit, and stock value
          </p>
        </div>
        <mat-icon class="report-arrow">arrow_forward</mat-icon>
      </a>

      <!-- Farmers Export -->
      <div class="report-card glass-card">
        <div
          class="report-icon-wrap"
          style="background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05));"
        >
          <mat-icon style="color: var(--clr-success);">people</mat-icon>
        </div>
        <div class="report-info">
          <h3>Farmer Ledger</h3>
          <p>Download full farmer list with current balances and details</p>
        </div>
        <button mat-icon-button (click)="exportFarmers()" class="download-btn">
          <mat-icon>download</mat-icon>
        </button>
      </div>

      <!-- Stock Export -->
      <div class="report-card glass-card">
        <div
          class="report-icon-wrap"
          style="background: linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05));"
        >
          <mat-icon style="color: var(--clr-warning);">inventory</mat-icon>
        </div>
        <div class="report-info">
          <h3>Stock Report</h3>
          <p>Download current inventory levels, stock value, and prices</p>
        </div>
        <button mat-icon-button (click)="exportStock()" class="download-btn">
          <mat-icon>download</mat-icon>
        </button>
      </div>

      <!-- Stock History Export -->
      <div class="report-card glass-card">
        <div
          class="report-icon-wrap"
          style="background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05));"
        >
          <mat-icon style="color: var(--clr-accent-light);">history</mat-icon>
        </div>
        <div class="report-info">
          <h3>Stock Movement Log</h3>
          <p>
            Download complete audit trail of all stock additions and reductions
          </p>
        </div>
        <button
          mat-icon-button
          (click)="exportStockHistory()"
          class="download-btn"
        >
          <mat-icon>download</mat-icon>
        </button>
      </div>

      <!-- Overdue Farmers Export -->
      <div class="report-card glass-card">
        <div
          class="report-icon-wrap"
          style="background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05));"
        >
          <mat-icon style="color: var(--clr-danger);">account_balance</mat-icon>
        </div>
        <div class="report-info">
          <h3>Pending Dues</h3>
          <p>Download list of farmers with outstanding balances only</p>
        </div>
        <button
          mat-icon-button
          (click)="exportOverdueFarmers()"
          class="download-btn"
        >
          <mat-icon>download</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .page-title {
        margin-bottom: 4px;
      }
      .page-subtitle {
        color: var(--clr-text-muted);
        margin-bottom: 24px;
        font-size: 14px;
      }

      .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 16px;
      }

      .report-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px;
        text-decoration: none;
        transition: all var(--duration-normal) var(--ease-out);
      }

      a.report-card {
        cursor: pointer;
      }

      .report-card:hover {
        transform: translateY(-2px);
        border-color: rgba(99, 102, 241, 0.3) !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
      }

      .report-icon-wrap {
        width: 52px;
        height: 52px;
        border-radius: var(--radius-md);
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }

      .report-icon-wrap mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .report-info {
        flex: 1;
      }

      .report-info h3 {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .report-info p {
        margin: 0;
        font-size: 12px;
        color: var(--clr-text-muted);
        line-height: 1.5;
      }

      .report-arrow {
        color: var(--clr-text-muted);
        font-size: 20px;
        width: 20px;
        height: 20px;
        opacity: 0;
        transition: opacity var(--duration-fast) ease;
      }

      a.report-card:hover .report-arrow {
        opacity: 1;
      }

      .download-btn {
        color: var(--clr-primary-light) !important;
        background: rgba(99, 102, 241, 0.1);
        border-radius: 50%;
      }

      .download-btn:hover {
        background: rgba(99, 102, 241, 0.2);
      }
    `,
  ],
})
export class ReportsComponent {
  constructor(private api: ApiService) {}

  exportFarmers() {
    this.api.farmers().subscribe((farmers) => {
      this.api.exportCsv(
        "farmers_ledger",
        [
          "ID",
          "Name",
          "Phone",
          "Village",
          "Land (Acres)",
          "Current Balance (₹)",
        ],
        farmers,
        (f) => [
          f.id,
          f.name,
          f.phone,
          f.village,
          f.landAcres,
          f.currentBalance,
        ],
      );
    });
  }

  exportOverdueFarmers() {
    this.api.farmers().subscribe((farmers) => {
      const overdue = farmers.filter(
        (f) => f.currentBalance && f.currentBalance > 0,
      );
      this.api.exportCsv(
        "overdue_farmers",
        ["ID", "Name", "Phone", "Village", "Outstanding Balance (₹)"],
        overdue,
        (f) => [f.id, f.name, f.phone, f.village, f.currentBalance],
      );
    });
  }

  exportStock() {
    this.api.stock().subscribe((stock) => {
      this.api.exportCsv(
        "stock_report",
        [
          "Category",
          "Product",
          "Current Quantity",
          "Unit",
          "Price per Unit (₹)",
          "Total Value (₹)",
        ],
        stock,
        (s) => [
          s.product?.category?.name,
          s.product?.name,
          s.quantity,
          s.product?.unit,
          s.product?.pricePerUnit,
          (s.quantity * (s.product?.pricePerUnit || 0)).toFixed(2),
        ],
      );
    });
  }

  exportStockHistory() {
    this.api.stockMovements().subscribe((movements) => {
      this.api.exportCsv(
        "stock_history",
        ["Date", "Product", "Category", "Type", "Quantity", "Note"],
        movements,
        (m) => [
          new Date(m.movedAt).toLocaleString(),
          m.product?.name,
          m.product?.category?.name,
          m.movementType,
          m.quantity,
          m.note,
        ],
      );
    });
  }
}
