import { Component, OnInit } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { DecimalPipe, NgFor, NgIf, DatePipe, AsyncPipe } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ApiService } from "../core/api.service";
import { AuthService } from "../core/auth.service";
import { FarmerDashboardComponent } from "./farmer-dashboard.component";

@Component({
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe,
    AsyncPipe,
    NgFor,
    NgIf,
    RouterLink,
    FarmerDashboardComponent,
  ],
  template: `
    <!-- Show Farmer Dashboard if user is farmer -->
    <ng-container *ngIf="auth.isFarmer(); else adminDashboard">
      <app-farmer-dashboard></app-farmer-dashboard>
    </ng-container>

    <!-- Admin Dashboard -->
    <ng-template #adminDashboard>
      <div class="dashboard-header">
        <div class="header-left">
          <h2 class="page-title">Dashboard</h2>
          <mat-form-field appearance="outline" class="farmer-search">
            <mat-icon matPrefix>search</mat-icon>
            <input
              type="text"
              matInput
              [formControl]="searchCtrl"
              [matAutocomplete]="auto"
              placeholder="Search Farmer Profile..."
            />
            <mat-autocomplete
              #auto="matAutocomplete"
              [displayWith]="displayFarmer"
              (optionSelected)="goToFarmer($event.option.value)"
            >
              <mat-option *ngFor="let f of filteredFarmers | async" [value]="f">
                {{ f.name }} ({{ f.village }})
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>
        </div>
        <div class="quick-actions">
          <button mat-raised-button color="primary" routerLink="/credit">
            <mat-icon>add</mat-icon> New Credit
          </button>
          <button mat-raised-button color="accent" routerLink="/settlement">
            <mat-icon>handshake</mat-icon> New Settlement
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div
          *ngFor="let card of dashboardCards; let i = index"
          class="stat-card glass-card"
          [style.animation-delay]="i * 0.1 + 's'"
        >
          <div class="stat-icon-wrap" [style.background]="card.gradient">
            <span class="stat-emoji">{{ card.icon }}</span>
          </div>
          <div class="stat-body">
            <span class="stat-label">{{ card.label }}</span>
            <span
              class="stat-value"
              [title]="
                (card.value < 0 ? '-' : '') +
                (card.prefix || '') +
                ((card.value < 0 ? -card.value : card.value) | number: '1.0-0')
              "
              >{{ card.value < 0 ? "-" : "" }}{{ card.prefix || ""
              }}{{
                (card.value < 0 ? -card.value : card.value) | number: "1.0-0"
              }}</span
            >
            <span class="stat-desc">{{ card.description }}</span>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="dashboard-layout">
        <!-- Left Column: Activity & Metrics -->
        <div class="main-column">
          <div class="metrics-section">
            <h3 class="section-title">Key Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card glass-card">
                <mat-icon
                  class="metric-icon"
                  style="color: var(--clr-primary-light)"
                  >person</mat-icon
                >
                <div class="metric-info">
                  <span class="metric-label">Avg Credit / Farmer</span>
                  <span class="metric-value"
                    >₹{{ avgCredit | number: "1.0-0" }}</span
                  >
                </div>
              </div>
              <div class="metric-card glass-card">
                <mat-icon class="metric-icon" style="color: var(--clr-warning)"
                  >inventory_2</mat-icon
                >
                <div class="metric-info">
                  <span class="metric-label">Total Stock Value</span>
                  <span class="metric-value"
                    >₹{{ totalStockValue | number: "1.0-0" }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="activity-section glass-card">
            <div class="section-header">
              <mat-icon>history</mat-icon>
              <span>Recent Activity</span>
            </div>
            <div
              class="activity-list"
              *ngIf="recentActivity.length > 0; else noActivity"
            >
              <div class="activity-item" *ngFor="let item of recentActivity">
                <div
                  class="activity-icon"
                  [class.is-credit]="item.type === 'CREDIT'"
                >
                  <mat-icon>{{
                    item.type === "CREDIT" ? "shopping_cart" : "done_all"
                  }}</mat-icon>
                </div>
                <div class="activity-details">
                  <span class="activity-title">
                    {{ item.farmerName }}
                    <span class="activity-type">{{
                      item.type === "CREDIT" ? "took credit" : "made settlement"
                    }}</span>
                  </span>
                  <span class="activity-time">{{
                    item.date | date: "MMM d, h:mm a"
                  }}</span>
                </div>
                <div
                  class="activity-amount"
                  [class.is-credit]="item.type === 'CREDIT'"
                >
                  {{ item.type === "CREDIT" ? "+" : "-" }}₹{{
                    item.amount | number: "1.2-2"
                  }}
                </div>
              </div>
            </div>
            <ng-template #noActivity>
              <div class="empty-state">No recent activity</div>
            </ng-template>
          </div>
        </div>

        <!-- Right Column: Alerts -->
        <div class="sidebar-column">
          <!-- Overdue Farmers -->
          <div class="alerts-card glass-card">
            <div class="section-header">
              <mat-icon style="color: var(--clr-danger)">warning</mat-icon>
              <span>High Outstanding</span>
            </div>
            <div
              class="alert-list"
              *ngIf="overdueFarmers.length > 0; else noOverdue"
            >
              <div class="alert-item" *ngFor="let f of overdueFarmers">
                <div class="alert-info">
                  <span class="alert-name">{{ f.name }}</span>
                  <span class="alert-sub">{{ f.phone }}</span>
                </div>
                <span class="alert-value text-danger"
                  >₹{{ f.balance | number: "1.0-0" }}</span
                >
              </div>
            </div>
            <ng-template #noOverdue>
              <div class="empty-state">
                No farmers with high outstanding balance.
              </div>
            </ng-template>
          </div>

          <!-- Low Stock -->
          <div class="alerts-card glass-card">
            <div class="section-header">
              <mat-icon style="color: var(--clr-warning)">inventory</mat-icon>
              <span>Low Stock Alerts</span>
            </div>
            <div
              class="alert-list"
              *ngIf="lowStockAlerts.length > 0; else noLowStock"
            >
              <div class="alert-item" *ngFor="let s of lowStockAlerts">
                <div class="alert-info">
                  <span class="alert-name">{{ s.productName }}</span>
                </div>
                <span class="alert-value text-warning"
                  >{{ s.quantity }} {{ s.unit }}s</span
                >
              </div>
            </div>
            <ng-template #noLowStock>
              <div class="empty-state">All products have sufficient stock.</div>
            </ng-template>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 24px;
      }

      .page-title {
        margin: 0;
      }

      .farmer-search {
        min-width: 300px;
        margin-bottom: -1.25em; /* Compensate for mat-form-field bottom padding */
      }

      .quick-actions {
        display: flex;
        gap: 12px;
      }

      /* Stats Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 18px;
        padding: 22px;
        animation: slideUp 0.5s var(--ease-out) both;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .stat-icon-wrap {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        border-radius: var(--radius-md);
        flex-shrink: 0;
      }

      .stat-emoji {
        font-size: 24px;
      }

      .stat-body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .stat-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--clr-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }

      .stat-value {
        font-size: clamp(20px, 2.5vw, 26px);
        font-weight: 700;
        color: var(--clr-text);
        letter-spacing: -0.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .stat-desc {
        font-size: 12px;
        color: var(--clr-text-muted);
      }

      /* Layout */
      .dashboard-layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }

      @media (max-width: 900px) {
        .dashboard-layout {
          grid-template-columns: 1fr;
        }
      }

      .main-column,
      .sidebar-column {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* Metrics Section */
      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--clr-text-secondary);
        margin: 0 0 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      .metric-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
      }

      .metric-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        opacity: 0.9;
      }

      .metric-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .metric-label {
        font-size: 11px;
        color: var(--clr-text-muted);
        font-weight: 500;
      }

      .metric-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--clr-text);
      }

      /* Common Cards */
      .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--clr-border);
        font-size: 14px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .section-header mat-icon {
        color: var(--clr-primary-light);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .empty-state {
        padding: 32px;
        text-align: center;
        color: var(--clr-text-muted);
        font-size: 13px;
      }

      /* Activity Feed */
      .activity-list {
        padding: 12px 20px;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 0;
        border-bottom: 1px solid var(--clr-border);
      }

      .activity-item:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--clr-info-soft);
        color: var(--clr-info);
        display: grid;
        place-items: center;
      }

      .activity-icon.is-credit {
        background: var(--clr-warning-soft);
        color: var(--clr-warning);
      }

      .activity-icon mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .activity-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .activity-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .activity-type {
        font-weight: 400;
        color: var(--clr-text-secondary);
      }

      .activity-time {
        font-size: 11px;
        color: var(--clr-text-muted);
      }

      .activity-amount {
        font-weight: 700;
        font-size: 14px;
        color: var(--clr-success);
      }

      .activity-amount.is-credit {
        color: var(--clr-warning);
      }

      /* Alerts List */
      .alert-list {
        padding: 12px 20px;
      }

      .alert-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--clr-border);
      }

      .alert-item:last-child {
        border-bottom: none;
      }

      .alert-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .alert-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--clr-text);
      }

      .alert-sub {
        font-size: 11px;
        color: var(--clr-text-muted);
      }

      .alert-value {
        font-size: 13px;
        font-weight: 700;
      }

      .text-danger {
        color: var(--clr-danger);
      }
      .text-warning {
        color: var(--clr-warning);
      }

      /* Crop Ticker */
      .crop-ticker {
        display: flex;
        align-items: center;
        gap: 0;
        padding: 0;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .ticker-label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-right: 1px solid var(--clr-border);
        font-size: 12px;
        font-weight: 700;
        color: var(--clr-text);
        white-space: nowrap;
        background: rgba(99, 102, 241, 0.05);
        flex-shrink: 0;
      }

      .ticker-label mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--clr-primary-light);
      }

      .ticker-demo {
        font-size: 9px;
        padding: 1px 6px;
        border-radius: var(--radius-full);
        background: var(--clr-warning-soft);
        color: var(--clr-warning);
        font-weight: 700;
        letter-spacing: 0.5px;
      }

      .ticker-track {
        display: flex;
        gap: 0;
        overflow-x: auto;
        scrollbar-width: none;
        flex: 1;
      }

      .ticker-track::-webkit-scrollbar {
        display: none;
      }

      .ticker-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-right: 1px solid var(--clr-border);
        white-space: nowrap;
      }

      .ticker-crop {
        font-size: 13px;
        font-weight: 600;
        color: var(--clr-text);
      }
      .ticker-price {
        font-size: 14px;
        font-weight: 800;
      }
      .ticker-change {
        font-size: 11px;
        font-weight: 600;
        color: var(--clr-text-muted);
      }
      .ticker-change.up {
        color: var(--clr-success);
      }
      .ticker-change.down {
        color: var(--clr-danger);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  dashboardCards: any[] = [];
  avgCredit = 0;
  totalStockValue = 0;
  totalOutstanding = 0;

  overdueFarmers: any[] = [];
  lowStockAlerts: any[] = [];
  recentActivity: any[] = [];
  cropPrices: any[] = [];
  cropPricesDemo = false;

  searchCtrl = new FormControl();
  farmers: any[] = [];
  filteredFarmers!: Observable<any[]>;

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.auth.isFarmer()) {
      return;
    }
    this.api.getCropPrices().subscribe((res) => {
      this.cropPrices = res.prices || [];
      this.cropPricesDemo = res.source === "demo";
    });

    this.api.farmers().subscribe((f) => {
      this.farmers = f;
      this.filteredFarmers = this.searchCtrl.valueChanges.pipe(
        startWith(""),
        map((value) => {
          const name = typeof value === "string" ? value : (value as any)?.name;
          return name
            ? this._filterFarmers(name as string)
            : this.farmers.slice();
        }),
      );
    });

    this.api.dashboard().subscribe((d: any) => {
      this.dashboardCards = [
        {
          label: "Total Farmers",
          value: d.totalFarmers,
          icon: "👨‍🌾",
          prefix: "",
          gradient:
            "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))",
          description: "Active farmers in system",
        },
        {
          label: "Outstanding Credit",
          value: d.totalOutstandingCredit,
          icon: "💳",
          prefix: "₹",
          gradient:
            "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))",
          description: "Total credit given",
        },
        {
          label: "Stock Value",
          value: d.totalStockValue,
          icon: "📦",
          prefix: "₹",
          gradient:
            "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))",
          description: "Current inventory value",
        },

      ];

      this.avgCredit =
        d.totalFarmers > 0 ? d.totalOutstandingCredit / d.totalFarmers : 0;
      this.totalStockValue = d.totalStockValue;
      this.totalOutstanding = d.totalOutstandingCredit;

      this.overdueFarmers = d.overdueFarmers || [];
      this.lowStockAlerts = d.lowStockAlerts || [];

      const credits = (d.recentCredits || []).map((x: any) => ({
        ...x,
        date: new Date(x.date),
      }));
      const settlements = (d.recentSettlements || []).map((x: any) => ({
        ...x,
        date: new Date(x.date),
      }));

      this.recentActivity = [...credits, ...settlements]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 8);
    });
  }

  private _filterFarmers(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(filterValue) ||
        (f.phone && f.phone.includes(filterValue)) ||
        (f.village && f.village.toLowerCase().includes(filterValue)),
    );
  }

  displayFarmer(farmer: any): string {
    return farmer && farmer.name ? `${farmer.name}` : "";
  }

  goToFarmer(farmer: any) {
    if (farmer && farmer.id) {
      this.router.navigate(["/farmer", farmer.id]);
    }
  }
}
