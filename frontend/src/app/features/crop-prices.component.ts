import { Component, OnInit } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ApiService } from "../core/api.service";
import { AuthService } from "../core/auth.service";

@Component({
  selector: "app-crop-prices",
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">Market Prices</h2>
        <span class="header-sub">Mandi rates updated daily by admin</span>
      </div>
      <div class="header-right" *ngIf="auth.isAdmin()">
        <button mat-raised-button color="primary" (click)="addRow()" *ngIf="!addingNew">
          <mat-icon>add</mat-icon> Add Crop
        </button>
      </div>
    </div>

    <!-- Last Updated Badge -->
    <div class="last-updated glass-card" *ngIf="lastUpdated">
      <mat-icon>schedule</mat-icon>
      <span>Last updated: <strong>{{ lastUpdated }}</strong></span>
      <span class="source-badge">{{ source === 'database' ? '✓ Live DB' : 'Demo' }}</span>
    </div>

    <!-- Admin: Add New Crop Row -->
    <div class="form-card glass-card" *ngIf="auth.isAdmin() && addingNew">
      <div class="form-header">
        <mat-icon>add_circle</mat-icon>
        <span>Add New Crop Price</span>
      </div>
      <div class="add-form">
        <div class="field-group">
          <label class="field-label">Crop Name</label>
          <input class="field-input" [(ngModel)]="newCrop.cropName" placeholder="e.g. Jowar">
        </div>
        <div class="field-group">
          <label class="field-label">Telugu Name</label>
          <input class="field-input" [(ngModel)]="newCrop.cropNameTelugu" placeholder="e.g. జొన్న">
        </div>
        <div class="field-group">
          <label class="field-label">Unit</label>
          <input class="field-input" [(ngModel)]="newCrop.unit" placeholder="₹/Quintal">
        </div>
        <div class="field-group">
          <label class="field-label">Price (₹)</label>
          <input class="field-input" type="number" [(ngModel)]="newCrop.price">
        </div>
        <div class="field-group">
          <label class="field-label">Min Price</label>
          <input class="field-input" type="number" [(ngModel)]="newCrop.minPrice">
        </div>
        <div class="field-group">
          <label class="field-label">Max Price</label>
          <input class="field-input" type="number" [(ngModel)]="newCrop.maxPrice">
        </div>
        <div class="field-group">
          <label class="field-label">Trend</label>
          <select class="field-input" [(ngModel)]="newCrop.trend">
            <option value="up">↑ Up</option>
            <option value="down">↓ Down</option>
            <option value="stable">— Stable</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Change %</label>
          <input class="field-input" [(ngModel)]="newCrop.changePercent" placeholder="+1.2%">
        </div>
        <div class="field-group">
          <label class="field-label">Market</label>
          <input class="field-input" [(ngModel)]="newCrop.market" placeholder="Nizamabad">
        </div>
      </div>
      <div class="form-actions">
        <button mat-raised-button color="primary" (click)="saveNew()">
          <mat-icon>save</mat-icon> Save
        </button>
        <button mat-button (click)="addingNew = false">Cancel</button>
      </div>
    </div>

    <!-- Price Cards -->
    <div class="prices-grid" *ngIf="prices.length > 0; else loading">
      <div class="price-card glass-card" *ngFor="let p of prices">
        <!-- View Mode -->
        <ng-container *ngIf="editingId !== p.id">
          <div class="price-card-header" [style.border-left-color]="p.color">
            <div class="crop-info">
              <span class="crop-name">{{ p.crop }}</span>
              <span class="crop-telugu">{{ p.cropTelugu }}</span>
            </div>
            <span class="trend-badge" [class.up]="p.trend==='up'" [class.down]="p.trend==='down'" [class.stable]="p.trend==='stable'">
              {{ p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '—' }}
              {{ p.change }}
            </span>
          </div>
          <div class="price-main">
            <span class="price-value" [style.color]="p.color">₹{{ p.price | number:'1.0-0' }}</span>
            <span class="price-unit">{{ p.unit }}</span>
          </div>
          <div class="price-range">
            <span>Low: <strong>₹{{ p.minPrice | number:'1.0-0' }}</strong></span>
            <span>High: <strong>₹{{ p.maxPrice | number:'1.0-0' }}</strong></span>
          </div>
          <div class="price-footer">
            <mat-icon class="market-icon">location_on</mat-icon>
            <span class="market-name">{{ p.market }}</span>
            <span class="updated-by" *ngIf="p.lastUpdatedBy">by {{ p.lastUpdatedBy }}</span>
          </div>
          <!-- Admin actions -->
          <div class="card-actions" *ngIf="auth.isAdmin()">
            <button mat-icon-button (click)="startEdit(p)" title="Edit price">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button class="del-btn" (click)="delete(p.id)" title="Delete">
              <mat-icon>delete_outline</mat-icon>
            </button>
          </div>
        </ng-container>

        <!-- Edit Mode (Admin only) -->
        <ng-container *ngIf="editingId === p.id">
          <div class="edit-mode">
            <div class="edit-title">
              <mat-icon>edit</mat-icon>
              <span>Edit — {{ p.crop }}</span>
            </div>
            <div class="edit-grid">
              <div class="field-group">
                <label class="field-label">Price (₹)</label>
                <input class="field-input" type="number" [(ngModel)]="editData.price">
              </div>
              <div class="field-group">
                <label class="field-label">Min Price</label>
                <input class="field-input" type="number" [(ngModel)]="editData.minPrice">
              </div>
              <div class="field-group">
                <label class="field-label">Max Price</label>
                <input class="field-input" type="number" [(ngModel)]="editData.maxPrice">
              </div>
              <div class="field-group">
                <label class="field-label">Trend</label>
                <select class="field-input" [(ngModel)]="editData.trend">
                  <option value="up">↑ Up</option>
                  <option value="down">↓ Down</option>
                  <option value="stable">— Stable</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Change %</label>
                <input class="field-input" [(ngModel)]="editData.changePercent" placeholder="+1.2%">
              </div>
              <div class="field-group">
                <label class="field-label">Market</label>
                <input class="field-input" [(ngModel)]="editData.market">
              </div>
            </div>
            <div class="edit-actions">
              <button mat-raised-button color="primary" (click)="saveEdit(p.id)">
                <mat-icon>save</mat-icon> Save
              </button>
              <button mat-button (click)="cancelEdit()">Cancel</button>
            </div>
          </div>
        </ng-container>
      </div>
    </div>

    <ng-template #loading>
      <div class="empty-state glass-card">
        <mat-icon class="empty-icon">bar_chart</mat-icon>
        <span class="empty-title">No market prices found</span>
        <span class="empty-desc" *ngIf="auth.isAdmin()">Click "Add Crop" to add the first price entry</span>
      </div>
    </ng-template>

    <!-- Success Toast -->
    <div class="toast success" *ngIf="successMsg">
      <mat-icon>check_circle</mat-icon>
      {{ successMsg }}
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .header-left { display: flex; flex-direction: column; gap: 4px; }
    .header-sub { font-size: 12px; color: var(--clr-text-muted); }

    .last-updated {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      margin-bottom: 20px;
      font-size: 13px;
      color: var(--clr-text-secondary);
    }

    .last-updated mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--clr-primary-light); }

    .source-badge {
      margin-left: auto;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: var(--clr-success-soft);
      color: var(--clr-success);
      font-weight: 700;
    }

    .form-card {
      margin-bottom: 20px;
      padding: 0;
      overflow: hidden;
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border-bottom: 1px solid var(--clr-border);
      font-size: 14px;
      font-weight: 600;
      color: var(--clr-text);
    }

    .form-header mat-icon { color: var(--clr-primary-light); font-size: 20px; width: 20px; height: 20px; }

    .add-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      padding: 20px;
    }

    .form-actions {
      padding: 0 20px 20px;
      display: flex;
      gap: 10px;
    }

    .prices-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .price-card {
      padding: 0;
      overflow: hidden;
      position: relative;
      transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
    }

    .price-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg) !important;
    }

    .price-card-header {
      padding: 16px 20px 12px;
      border-left: 4px solid var(--clr-primary);
      background: var(--clr-surface-alt);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .crop-info { display: flex; flex-direction: column; gap: 2px; }
    .crop-name { font-size: 16px; font-weight: 700; color: var(--clr-text); }
    .crop-telugu { font-size: 13px; color: var(--clr-text-muted); }

    .trend-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
    }
    .trend-badge.up { background: var(--clr-success-soft); color: var(--clr-success); }
    .trend-badge.down { background: var(--clr-danger-soft); color: var(--clr-danger); }
    .trend-badge.stable { background: var(--clr-info-soft); color: var(--clr-info); }

    .price-main {
      padding: 16px 20px 8px;
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .price-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
    .price-unit { font-size: 12px; color: var(--clr-text-muted); font-weight: 500; }

    .price-range {
      padding: 0 20px 12px;
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: var(--clr-text-secondary);
    }

    .price-range strong { color: var(--clr-text); }

    .price-footer {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 20px;
      border-top: 1px solid var(--clr-border);
      font-size: 12px;
      color: var(--clr-text-muted);
    }

    .market-icon { font-size: 14px; width: 14px; height: 14px; color: var(--clr-primary-light); }
    .market-name { font-weight: 600; color: var(--clr-text-secondary); }
    .updated-by { margin-left: auto; font-size: 10px; }

    .card-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .price-card:hover .card-actions { opacity: 1; }

    .card-actions button {
      width: 28px !important;
      height: 28px !important;
    }

    .card-actions button mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .del-btn { color: var(--clr-danger) !important; }

    /* Edit Mode */
    .edit-mode { padding: 20px; }
    .edit-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--clr-primary-light);
      margin-bottom: 16px;
    }

    .edit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .edit-actions { display: flex; gap: 8px; }

    /* Common Field */
    .field-group { display: flex; flex-direction: column; gap: 4px; }

    .field-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--clr-text-muted);
    }

    .field-input {
      padding: 8px 12px;
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-sm);
      background: var(--clr-surface);
      color: var(--clr-text);
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s;
    }

    .field-input:focus { border-color: var(--clr-primary-light); }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      z-index: 9999;
      animation: slideUp 0.3s ease;
      box-shadow: var(--shadow-lg);
    }

    .toast.success {
      background: var(--clr-success);
      color: white;
    }

    .toast mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px;
      text-align: center;
    }

    .empty-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 16px; }
    .empty-title { font-size: 16px; font-weight: 600; color: var(--clr-text); margin-bottom: 6px; }
    .empty-desc { font-size: 13px; color: var(--clr-text-muted); }
  `],
})
export class CropPricesComponent implements OnInit {
  prices: any[] = [];
  lastUpdated = "";
  source = "";

  editingId: number | null = null;
  editData: any = {};

  addingNew = false;
  newCrop: any = {
    cropName: "",
    cropNameTelugu: "",
    unit: "₹/Quintal",
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    trend: "stable",
    changePercent: "0.0%",
    market: "",
  };

  successMsg = "";

  constructor(
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getMarketPrices().subscribe((res: any) => {
      this.prices = res.prices || [];
      this.lastUpdated = res.lastUpdated || "";
      this.source = res.source || "";
    });
  }

  startEdit(p: any): void {
    this.editingId = p.id;
    this.editData = {
      price: p.price,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      trend: p.trend,
      changePercent: p.change,
      market: p.market,
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editData = {};
  }

  saveEdit(id: number): void {
    this.api.updateMarketPrice(id, this.editData).subscribe(() => {
      this.editingId = null;
      this.load();
      this.showSuccess("Price updated successfully!");
    });
  }

  addRow(): void {
    this.addingNew = true;
  }

  saveNew(): void {
    this.api.createMarketPrice(this.newCrop).subscribe(() => {
      this.addingNew = false;
      this.newCrop = {
        cropName: "", cropNameTelugu: "", unit: "₹/Quintal",
        price: 0, minPrice: 0, maxPrice: 0,
        trend: "stable", changePercent: "0.0%", market: "",
      };
      this.load();
      this.showSuccess("New crop added!");
    });
  }

  delete(id: number): void {
    if (confirm("Remove this crop price?")) {
      this.api.deleteMarketPrice(id).subscribe(() => {
        this.load();
        this.showSuccess("Crop price removed.");
      });
    }
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = ""), 3000);
  }
}
