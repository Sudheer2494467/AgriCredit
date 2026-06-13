import { Component } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatBadgeModule } from "@angular/material/badge";
import { slideInAnimation } from "./shared/route.animations";
import { AuthService } from "./core/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  animations: [slideInAnimation],
  template: `
    <ng-container *ngIf="auth.isAuthenticated(); else loginOnly">
      <mat-sidenav-container class="app-shell">
        <mat-sidenav mode="side" opened class="sidebar">
          <!-- Brand Area -->
          <div class="sidebar-brand">
            <div class="brand-icon">🌾</div>
            <div class="brand-text">
              <h3 class="brand-title">AgriLedger</h3>
              <span class="brand-role">{{
                auth.isAdmin() ? "ADMIN" : "FARMER"
              }}</span>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="sidebar-nav">
            <!-- Admin Navigation -->
            <ng-container *ngIf="auth.isAdmin()">
              <div class="nav-section-label">OVERVIEW</div>
              <a
                routerLink="/admindashboard"
                routerLinkActive="nav-active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-link"
              >
                <mat-icon>dashboard</mat-icon>
                <span>Dashboard</span>
              </a>

              <div class="nav-section-label">MANAGEMENT</div>
              <a
                routerLink="/farmers"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>people</mat-icon>
                <span>Farmers</span>
              </a>
              <a
                routerLink="/products"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>inventory_2</mat-icon>
                <span>Products</span>
              </a>
              <a
                routerLink="/stock"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>warehouse</mat-icon>
                <span>Stock</span>
              </a>
              <a
                routerLink="/stock-history"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>history</mat-icon>
                <span>Stock History</span>
              </a>

              <div class="nav-section-label">TRANSACTIONS</div>
              <a
                routerLink="/credit"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>credit_card</mat-icon>
                <span>Credit Entry</span>
              </a>
              <a
                routerLink="/farmer-ledger"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>menu_book</mat-icon>
                <span>Farmer Ledger</span>
              </a>
              <a
                routerLink="/settlement"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>done_all</mat-icon>
                <span>Settlement</span>
              </a>

              <div class="nav-section-label">ANALYTICS & CONFIG</div>
              <a
                routerLink="/reports"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>assessment</mat-icon>
                <span>Reports</span>
              </a>
              <a
                routerLink="/market-prices"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>show_chart</mat-icon>
                <span>Market Prices</span>
              </a>
              <a
                routerLink="/settings"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </a>
            </ng-container>

            <!-- Farmer Navigation -->
            <ng-container *ngIf="auth.isFarmer()">
              <div class="nav-section-label">MY ACCOUNT</div>
              <a
                routerLink="/farmer-dashboard"
                routerLinkActive="nav-active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-link"
              >
                <mat-icon>home</mat-icon>
                <span>My Dashboard</span>
              </a>
              <a
                routerLink="/my-credits"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>credit_card</mat-icon>
                <span>My Credits</span>
              </a>
              <a
                routerLink="/crop-prices"
                routerLinkActive="nav-active"
                class="nav-link"
              >
                <mat-icon>show_chart</mat-icon>
                <span>Crop Prices</span>
              </a>
            </ng-container>
          </nav>

          <!-- Sidebar Footer -->
          <div class="sidebar-footer">
            <div class="sidebar-footer-content">
              <mat-icon>eco</mat-icon>
              <span>v1.0 — Season 2026</span>
            </div>
          </div>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <!-- Top Bar -->
          <header class="topbar">
            <h1 class="topbar-title">
              Fertilizer Shop — Credit & Crop Management
            </h1>
            <div class="topbar-actions">
              <button
                mat-icon-button
                [matMenuTriggerFor]="userMenu"
                class="avatar-btn"
              >
                <div class="avatar-circle">
                  {{ auth.isAdmin() ? "A" : "F" }}
                </div>
              </button>
              <mat-menu #userMenu="matMenu">
                <button mat-menu-item disabled>
                  <mat-icon>person</mat-icon>
                  <span>{{ getUserInfo() }}</span>
                </button>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  <span>Logout</span>
                </button>
              </mat-menu>
            </div>
          </header>

          <!-- Page Content -->
          <div class="content" [@slideInAnimation]="router.url">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>
    <ng-template #loginOnly><router-outlet></router-outlet></ng-template>
  `,
  styles: [
    `
      .app-shell {
        height: 100%;
        background: var(--clr-bg);
      }

      /* ── Sidebar ────────────────────────────────── */
      .sidebar {
        width: 260px !important;
        background: var(--grad-sidebar) !important;
        border-right: 1px solid var(--clr-border) !important;
      }

      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 22px 20px;
        border-bottom: 1px solid var(--clr-border);
      }

      .brand-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: var(--radius-md);
        background: var(--grad-primary);
        font-size: 22px;
        box-shadow: var(--shadow-glow);
      }

      .brand-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: -0.3px;
      }

      .brand-role {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: rgba(255, 255, 255, 0.7);
        text-transform: uppercase;
      }

      /* Navigation */
      .sidebar-nav {
        padding: 12px 12px;
        flex: 1;
        overflow-y: auto;
      }

      .nav-section-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: rgba(255, 255, 255, 0.5);
        padding: 16px 12px 6px;
        text-transform: uppercase;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: var(--radius-sm);
        color: rgba(255, 255, 255, 0.75);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        transition: all var(--duration-fast) var(--ease-out);
        margin-bottom: 2px;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .nav-link.nav-active {
        background: rgba(255, 255, 255, 0.18);
        color: #ffffff;
        font-weight: 600;
      }

      .nav-link.nav-active mat-icon {
        color: #ffffff;
      }

      .nav-link mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: rgba(255, 255, 255, 0.6);
        transition: color var(--duration-fast) ease;
        margin-right: 0;
      }

      /* Sidebar Footer */
      .sidebar-footer {
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
      }

      .sidebar-footer-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
      }

      .sidebar-footer-content mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: rgba(255, 255, 255, 0.7);
        margin-right: 0;
      }

      /* ── Top Bar ────────────────────────────────── */
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
        height: 64px;
        border-bottom: 1px solid var(--clr-border);
        background: var(--clr-surface);
        box-shadow: var(--shadow-sm);
      }

      .topbar-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--clr-text);
        margin: 0;
        letter-spacing: -0.2px;
      }

      .avatar-btn {
        padding: 0 !important;
      }

      .avatar-circle {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--grad-primary);
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        color: white;
        box-shadow: var(--shadow-glow);
      }

      /* ── Content ────────────────────────────────── */
      .main-content {
        background: var(--clr-bg);
      }

      .content {
        padding: 28px;
        overflow-y: auto;
        max-height: calc(100vh - 64px);
      }

      /* ── Misc ────────────────────────────────── */
      ::ng-deep .mat-mdc-list-item {
        --mdc-list-item-label-text-font: inherit;
      }

      mat-icon {
        margin-right: 0;
      }
    `,
  ],
})
export class AppComponent {
  constructor(
    public auth: AuthService,
    public router: Router,
  ) {
    // On app startup, if no valid auth data exists, redirect to login
    if (!this.auth.isAuthenticated() || !this.auth.getRole()) {
      localStorage.clear();
      this.router.navigate(["/login"]);
    }
  }

  getUserInfo(): string {
    return this.auth.isAdmin() ? "Admin" : "Farmer";
  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
