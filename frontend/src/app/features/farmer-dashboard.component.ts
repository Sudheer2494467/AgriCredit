import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ApiService } from "../core/api.service";
import { AuthService } from "../core/auth.service";

@Component({
  selector: "app-farmer-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div class="farmer-dashboard" *ngIf="farmer">
      <!-- Admin view back button -->
      <div class="admin-header" *ngIf="isAdminView">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> Back to Dashboard
        </button>
      </div>

      <!-- Pending Approval Notification Banner (farmer only) -->
      <div
        *ngIf="!isAdminView && pendingVouchers.length > 0"
        class="approval-banner"
      >
        <div class="banner-pulse"></div>
        <div class="banner-content">
          <div class="banner-icon">
            <mat-icon>notifications_active</mat-icon>
          </div>
          <div class="banner-text">
            <strong
              >{{ pendingVouchers.length }} credit voucher(s) need your
              approval!</strong
            >
            <span
              >Admin has created credit entries that require your confirmation
              to proceed.</span
            >
          </div>
          <a routerLink="/my-credits" class="banner-action-btn">
            <mat-icon>arrow_forward</mat-icon>
            Review & Approve
          </a>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="profile-card">
        <div class="profile-bg"></div>
        <div class="profile-content">
          <div class="profile-avatar">
            {{ farmer.name.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-info">
            <h2 class="farmer-name">{{ farmer.name }}</h2>
            <div class="profile-details">
              <span class="detail-item">📍 {{ farmer.village }}</span>
              <span class="detail-item">📱 {{ farmer.phone }}</span>
              <span class="detail-item">🌾 {{ farmer.landAcres }} acres</span>
            </div>
          </div>
          <div class="balance-card glass-card">
            <span class="balance-label">Current Balance</span>
            <span
              class="balance-value"
              [class.has-balance]="farmer.currentBalance > 0"
            >
              ₹{{ farmer.currentBalance | number: "1.2-2" }}
            </span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card glass-card">
          <div
            class="stat-icon-wrap"
            style="background: var(--clr-danger-soft);"
          >
            <mat-icon style="color: var(--clr-danger);">receipt_long</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Total Credit</span>
            <span class="stat-value">₹{{ totalCredit | number: "1.2-2" }}</span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div
            class="stat-icon-wrap"
            style="background: var(--clr-success-soft);"
          >
            <mat-icon style="color: var(--clr-success);">handshake</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Settlements</span>
            <span class="stat-value">{{ settlementCount }}</span>
          </div>
        </div>
        <div
          class="stat-card glass-card"
          [style.cursor]="isAdminView ? 'default' : 'pointer'"
          (click)="!isAdminView && router.navigate(['/my-credits'])"
        >
          <div
            class="stat-icon-wrap"
            style="background: var(--clr-warning-soft);"
          >
            <mat-icon style="color: var(--clr-warning);"
              >pending_actions</mat-icon
            >
          </div>
          <div class="stat-info">
            <span class="stat-label">Pending Approvals</span>
            <span
              class="stat-value"
              [style.color]="
                pendingVouchers.length > 0 ? 'var(--clr-warning)' : ''
              "
            >
              {{ pendingVouchers.length }}
            </span>
          </div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-icon-wrap" style="background: var(--clr-info-soft);">
            <mat-icon style="color: var(--clr-info);">inventory_2</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">Vouchers</span>
            <span class="stat-value">{{ creditVouchers.length }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Tiles (farmer only) -->
      <div class="quick-tiles" *ngIf="!isAdminView">
        <a routerLink="/my-credits" class="tile glass-card tile-credits">
          <div class="tile-icon"><mat-icon>credit_card</mat-icon></div>
          <div class="tile-label">My Credits</div>
          <div class="tile-sub">View all vouchers</div>
          <mat-icon class="tile-arrow">chevron_right</mat-icon>
          <div class="tile-badge" *ngIf="pendingVouchers.length > 0">
            {{ pendingVouchers.length }}
          </div>
        </a>
        <a routerLink="/crop-prices" class="tile glass-card tile-market">
          <div class="tile-icon"><mat-icon>show_chart</mat-icon></div>
          <div class="tile-label">Crop Prices</div>
          <div class="tile-sub">Live mandi rates</div>
          <mat-icon class="tile-arrow">chevron_right</mat-icon>
        </a>
        <div class="tile glass-card tile-balance">
          <div class="tile-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="tile-label">Outstanding</div>
          <div class="tile-sub tile-amount">
            ₹{{ farmer.currentBalance | number: "1.2-2" }}
          </div>
        </div>
      </div>

      <!-- Recent Credit Vouchers -->
      <div class="section-card glass-card">
        <div class="section-header">
          <mat-icon>receipt_long</mat-icon>
          <span>Recent Credit Vouchers</span>
          <a *ngIf="!isAdminView" routerLink="/my-credits" class="view-all"
            >View All</a
          >
        </div>
        <div *ngIf="creditVouchers.length === 0" class="empty-msg">
          <mat-icon>inbox</mat-icon>
          <span>No credit vouchers yet</span>
        </div>
        <div class="voucher-mini-list" *ngIf="creditVouchers.length > 0">
          <div
            class="voucher-mini"
            *ngFor="let v of creditVouchers.slice(0, 5)"
          >
            <div class="vm-left">
              <div class="vm-no">{{ v.voucherNo }}</div>
              <div class="vm-date">{{ formatDate(v.createdAt) }}</div>
            </div>
            <div class="vm-status" [class]="'status-' + v.status">
              {{ getStatusLabel(v.status) }}
            </div>
            <div class="vm-amount">
              ₹{{ v.totalCreditAmount | number: "1.2-2" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Settlement History -->
      <div class="section-card glass-card">
        <div class="section-header">
          <mat-icon>handshake</mat-icon>
          <span>Settlement History</span>
        </div>
        <div *ngIf="settlements.length === 0" class="empty-msg">
          <mat-icon>inbox</mat-icon>
          <span>No settlements yet</span>
        </div>
        <div class="voucher-mini-list" *ngIf="settlements.length > 0">
          <div
            class="voucher-mini settlement-row"
            *ngFor="let s of settlements.slice(0, 10)"
          >
            <div class="vm-left">
              <div class="vm-no">{{ s.settlementNo }}</div>
              <div class="vm-date">
                {{ formatSettlementDate(s.settlementDate) }}
              </div>
              <div class="vm-crop">
                {{ s.cropPurchase?.cropName }} -
                {{ s.cropPurchase?.quantity }}Kg &#64; ₹{{
                  s.cropPurchase?.pricePerKg
                }}/Kg
              </div>
            </div>
            <div class="settlement-details">
              <div class="sd-row">
                <span class="sd-label">Crop Value:</span>
                <span class="sd-value"
                  >₹{{ s.cropPurchase?.totalValue | number: "1.2-2" }}</span
                >
              </div>
              <div class="sd-row deduct">
                <span class="sd-label">Credit Deducted:</span>
                <span class="sd-value"
                  >-₹{{ s.creditDeducted | number: "1.2-2" }}</span
                >
              </div>
              <div class="sd-row deduct">
                <span class="sd-label">Interest:</span>
                <span class="sd-value"
                  >-₹{{ s.interestDeducted | number: "1.2-2" }}</span
                >
              </div>
              <div class="sd-row payout">
                <span class="sd-label">Payout:</span>
                <span class="sd-value success"
                  >₹{{ s.netPayout | number: "1.2-2" }}</span
                >
              </div>
              <div class="sd-row remaining" *ngIf="s.remainingBalance > 0">
                <span class="sd-label">Still Owed:</span>
                <span class="sd-value warning"
                  >₹{{ s.remainingBalance | number: "1.2-2" }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="section-card glass-card">
        <div class="section-header">
          <mat-icon>history</mat-icon>
          <span>Transaction History</span>
        </div>
        <div *ngIf="transactionHistory.length === 0" class="empty-msg">
          <mat-icon>inbox</mat-icon>
          <span>No transactions yet</span>
        </div>
        <div class="voucher-mini-list" *ngIf="transactionHistory.length > 0">
          <div
            class="voucher-mini"
            *ngFor="let t of transactionHistory.slice(0, 15)"
          >
            <div class="vm-left">
              <div class="vm-no" [ngClass]="'txn-type-' + t.type">
                {{ t.type }}
              </div>
              <div class="vm-date">{{ formatDate(t.date) }}</div>
              <div class="vm-desc">{{ t.description }}</div>
            </div>
            <div
              class="vm-amount"
              [ngClass]="{
                'txn-credit': t.type === 'CREDIT' || t.type === 'INTEREST',
                'txn-settlement': t.type === 'SETTLEMENT',
              }"
            >
              <span *ngIf="t.type === 'CREDIT' || t.type === 'INTEREST'"
                >+</span
              >
              <span *ngIf="t.type === 'SETTLEMENT'">-</span>
              ₹{{ t.amount | number: "1.2-2" }}
            </div>
          </div>
        </div>
      </div>
      <!-- Change Password (farmer only) -->
      <div class="section-card glass-card" *ngIf="!isAdminView">
        <div class="section-header">
          <mat-icon>lock_reset</mat-icon>
          <span>Change Password</span>
        </div>
        <div class="change-pwd-body">
          <form
            [formGroup]="pwdForm"
            (ngSubmit)="changePassword()"
            class="pwd-form"
          >
            <mat-form-field appearance="outline" class="pwd-field">
              <mat-label>Current Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="currentPassword"
                placeholder="Enter current password"
              />
            </mat-form-field>
            <mat-form-field appearance="outline" class="pwd-field">
              <mat-label>New Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="newPassword"
                placeholder="Min. 4 characters"
              />
              <mat-error
                *ngIf="pwdForm.get('newPassword')?.hasError('minlength')"
                >Min. 4 characters required</mat-error
              >
            </mat-form-field>
            <mat-form-field appearance="outline" class="pwd-field">
              <mat-label>Confirm New Password</mat-label>
              <input
                matInput
                type="password"
                formControlName="confirmPassword"
                placeholder="Repeat new password"
              />
              <mat-error
                *ngIf="
                  pwdForm.hasError('mismatch') &&
                  pwdForm.get('confirmPassword')?.touched
                "
                >Passwords do not match</mat-error
              >
            </mat-form-field>
            <div class="pwd-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="pwdForm.invalid || pwdLoading"
              >
                <mat-icon>{{
                  pwdLoading ? "hourglass_empty" : "lock_reset"
                }}</mat-icon>
                {{ pwdLoading ? "Changing..." : "Change Password" }}
              </button>
            </div>
            <div class="pwd-msg pwd-success" *ngIf="pwdSuccess">
              ✅ {{ pwdSuccess }}
            </div>
            <div class="pwd-msg pwd-error" *ngIf="pwdError">
              ❌ {{ pwdError }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .farmer-dashboard {
        display: flex;
        flex-direction: column;
        gap: 24px;
        animation: fadeIn 0.4s var(--ease-out);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .admin-header {
        margin-bottom: -8px;
      }

      /* Approval Banner */
      .approval-banner {
        position: relative;
        border-radius: var(--radius-lg);
        border: 1px solid var(--clr-warning);
        background: rgba(245, 158, 11, 0.06);
        overflow: hidden;
        padding: 20px;
      }

      .banner-pulse {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--clr-warning);
        animation: pulse-bar 2s ease-in-out infinite;
      }

      @keyframes pulse-bar {
        0%,
        100% {
          opacity: 0.4;
        }
        50% {
          opacity: 1;
        }
      }

      .banner-content {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }

      .banner-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: var(--clr-warning-soft);
        display: grid;
        place-items: center;
        flex-shrink: 0;
        animation: pulse-icon 1.5s ease-in-out infinite;
      }

      @keyframes pulse-icon {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }

      .banner-icon mat-icon {
        color: var(--clr-warning);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .banner-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .banner-text strong {
        font-size: 15px;
        color: var(--clr-warning);
      }
      .banner-text span {
        font-size: 12px;
        color: var(--clr-text-muted);
      }

      .banner-action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border-radius: var(--radius-sm);
        background: var(--clr-warning);
        color: white;
        text-decoration: none;
        font-size: 13px;
        font-weight: 700;
        transition: opacity 0.2s;
        white-space: nowrap;
      }

      .banner-action-btn:hover {
        opacity: 0.9;
      }
      .banner-action-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* Profile Card */
      .profile-card {
        position: relative;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 1px solid var(--clr-border);
      }

      .profile-bg {
        position: absolute;
        inset: 0;
        background: var(--grad-hero);
        opacity: 0.9;
      }

      .profile-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 28px;
      }

      .profile-avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        display: grid;
        place-items: center;
        font-size: 28px;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .profile-info {
        flex: 1;
      }

      .farmer-name {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: white;
      }

      .profile-details {
        display: flex;
        gap: 16px;
        margin-top: 6px;
        flex-wrap: wrap;
      }

      .detail-item {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.85);
      }

      .balance-card {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        padding: 14px 20px;
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
        backdrop-filter: blur(12px);
        min-width: 140px;
      }

      .balance-label {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 4px;
      }
      .balance-value {
        font-size: 22px;
        font-weight: 700;
        color: white;
      }
      .balance-value.has-balance {
        color: #fbbf24;
      }

      /* Stats Row */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        cursor: default;
        transition: transform 0.2s;
      }

      .stat-card[style*="pointer"]:hover {
        transform: translateY(-2px);
      }

      .stat-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }

      .stat-icon-wrap mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .stat-label {
        font-size: 11px;
        color: var(--clr-text-muted);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--clr-text);
      }

      /* Quick Tiles */
      .quick-tiles {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .tile {
        position: relative;
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-decoration: none;
        color: var(--clr-text);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        cursor: default;
      }

      a.tile {
        cursor: pointer;
      }
      a.tile:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      }

      .tile-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        display: grid;
        place-items: center;
        margin-bottom: 4px;
      }

      .tile-icon mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      .tile-credits .tile-icon {
        background: var(--clr-primary-glow);
      }
      .tile-credits .tile-icon mat-icon {
        color: var(--clr-primary-light);
      }

      .tile-market .tile-icon {
        background: var(--clr-success-soft);
      }
      .tile-market .tile-icon mat-icon {
        color: var(--clr-success);
      }

      .tile-balance .tile-icon {
        background: var(--clr-warning-soft);
      }
      .tile-balance .tile-icon mat-icon {
        color: var(--clr-warning);
      }

      .tile-label {
        font-size: 15px;
        font-weight: 700;
        color: var(--clr-text);
      }
      .tile-sub {
        font-size: 12px;
        color: var(--clr-text-muted);
      }
      .tile-amount {
        font-size: 16px;
        font-weight: 700;
        color: var(--clr-warning);
      }

      .tile-arrow {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--clr-text-muted) !important;
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
      }

      .tile-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--clr-warning);
        color: white;
        display: grid;
        place-items: center;
        font-size: 11px;
        font-weight: 800;
      }

      /* Section Card */
      .section-card {
        overflow: hidden;
      }

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

      .view-all {
        margin-left: auto;
        font-size: 12px;
        color: var(--clr-primary-light);
        text-decoration: none;
        font-weight: 600;
      }

      .view-all:hover {
        text-decoration: underline;
      }

      .empty-msg {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 32px;
        color: var(--clr-text-muted);
        font-size: 13px;
      }

      .empty-msg mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        opacity: 0.3;
      }

      /* Voucher Mini List */
      .voucher-mini-list {
        padding: 12px 20px;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .voucher-mini {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid var(--clr-border);
      }

      .voucher-mini:last-child {
        border-bottom: none;
      }

      .vm-left {
        flex: 1;
      }
      .vm-no {
        font-size: 12px;
        font-weight: 700;
        color: var(--clr-text);
        font-family: monospace;
      }
      .vm-date {
        font-size: 11px;
        color: var(--clr-text-muted);
        margin-top: 2px;
      }

      .vm-status {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: var(--radius-full);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .status-CONFIRMED {
        background: var(--clr-success-soft);
        color: var(--clr-success);
      }
      .status-PENDING_APPROVAL {
        background: var(--clr-warning-soft);
        color: var(--clr-warning);
      }
      .status-SETTLED {
        background: var(--clr-info-soft);
        color: var(--clr-info);
      }

      .vm-amount {
        font-size: 14px;
        font-weight: 700;
        color: var(--clr-text);
        min-width: 100px;
        text-align: right;
      }

      .vm-crop {
        font-size: 11px;
        color: var(--clr-text-muted);
        margin-top: 2px;
      }
      .vm-desc {
        font-size: 11px;
        color: var(--clr-text-muted);
        margin-top: 2px;
      }

      .settlement-row {
        flex-wrap: wrap;
        gap: 8px;
      }
      .settlement-details {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        width: 100%;
        padding-top: 8px;
      }
      .sd-row {
        display: flex;
        gap: 4px;
        font-size: 12px;
      }
      .sd-label {
        color: var(--clr-text-muted);
      }
      .sd-value {
        font-weight: 600;
        color: var(--clr-text);
      }
      .sd-row.deduct .sd-value {
        color: var(--clr-danger);
      }
      .sd-value.success {
        color: var(--clr-success) !important;
      }
      .sd-value.warning {
        color: var(--clr-warning) !important;
      }

      .txn-type-CREDIT {
        color: var(--clr-danger);
      }
      .txn-type-SETTLEMENT {
        color: var(--clr-success);
      }
      .txn-type-INTEREST {
        color: var(--clr-warning);
      }
      .txn-credit {
        color: var(--clr-danger) !important;
      }
      .txn-settlement {
        color: var(--clr-success) !important;
      }

      /* Change Password */
      .change-pwd-body {
        padding: 20px;
      }
      .pwd-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .pwd-field {
        width: 100%;
        max-width: 400px;
      }
      .pwd-actions {
        margin-top: 4px;
      }
      .pwd-actions button {
        background: var(--grad-primary) !important;
        color: white !important;
      }
      .pwd-msg {
        margin-top: 12px;
        font-size: 13px;
        font-weight: 600;
        padding: 10px 16px;
        border-radius: var(--radius-sm);
      }
      .pwd-success {
        background: var(--clr-success-soft);
        color: var(--clr-success);
      }
      .pwd-error {
        background: var(--clr-danger-soft);
        color: var(--clr-danger);
      }
    `,
  ],
})
export class FarmerDashboardComponent implements OnInit, OnDestroy {
  farmer: any;
  creditVouchers: any[] = [];
  pendingVouchers: any[] = [];
  settlements: any[] = [];
  transactionHistory: any[] = [];
  isAdminView = false;
  totalCredit = 0;
  settlementCount = 0;
  Math = Math;
  public pollTimer: any;

  // Change password
  pwdForm = this.fb.group(
    {
      currentPassword: ["", Validators.required],
      newPassword: ["", [Validators.required, Validators.minLength(4)]],
      confirmPassword: ["", Validators.required],
    },
    { validators: this.passwordMatchValidator },
  );
  pwdLoading = false;
  pwdSuccess = "";
  pwdError = "";

  constructor(
    public api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    const routeId = this.route.snapshot.paramMap.get("id");
    if (routeId) {
      this.isAdminView = true;
      this.loadFarmerData(parseInt(routeId, 10));
    } else {
      const farmerId = this.auth.getFarmerId();
      if (farmerId) {
        this.loadFarmerData(farmerId);
        // Poll for pending approvals every 10 seconds
        this.pollTimer = setInterval(() => this.checkPending(farmerId), 10000);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  goBack() {
    this.router.navigate(["/"]);
  }

  loadFarmerData(farmerId: number): void {
    this.api.getFarmer(farmerId).subscribe((farmer) => {
      this.farmer = farmer;
    });

    this.api.farmerCredits(farmerId).subscribe((vouchers) => {
      this.creditVouchers = vouchers;
      this.pendingVouchers = vouchers.filter(
        (v: any) => v.status === "PENDING_APPROVAL",
      );
      this.totalCredit = vouchers
        .filter((v: any) => v.status !== "PENDING_APPROVAL")
        .reduce((sum: number, v: any) => sum + (v.totalCreditAmount || 0), 0);
    });

    this.api.settlements(farmerId).subscribe((settlements) => {
      this.settlements = settlements;
      this.settlementCount = settlements.length;
    });

    this.api.farmerTransactionHistory(farmerId).subscribe((transactions) => {
      this.transactionHistory = transactions;
    });
  }

  checkPending(farmerId: number) {
    this.api.farmerPendingCredits(farmerId).subscribe((pending) => {
      const previousPendingCount = this.pendingVouchers.length;
      this.pendingVouchers = pending;

      // If pending count changed (approval happened), refresh all vouchers to get updated status
      if (previousPendingCount !== pending.length) {
        this.api.farmerCredits(farmerId).subscribe((vouchers) => {
          this.creditVouchers = vouchers;
          this.totalCredit = vouchers
            .filter((v: any) => v.status !== "PENDING_APPROVAL")
            .reduce(
              (sum: number, v: any) => sum + (v.totalCreditAmount || 0),
              0,
            );
        });
      }
    });
  }

  getStatusLabel(status: string): string {
    const map: any = {
      CONFIRMED: "Confirmed",
      PENDING_APPROVAL: "Pending",
      SETTLED: "Settled",
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatSettlementDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  passwordMatchValidator(form: any) {
    const newPwd = form.get("newPassword")?.value;
    const confirm = form.get("confirmPassword")?.value;
    return newPwd === confirm ? null : { mismatch: true };
  }

  changePassword() {
    if (this.pwdForm.invalid) return;
    this.pwdLoading = true;
    this.pwdSuccess = "";
    this.pwdError = "";
    const { currentPassword, newPassword } = this.pwdForm.value;
    this.api.changePassword(currentPassword!, newPassword!).subscribe({
      next: (res) => {
        this.pwdLoading = false;
        this.pwdSuccess =
          "Password changed successfully! Please use your new password next time you log in.";
        this.pwdForm.reset();
      },
      error: (err) => {
        this.pwdLoading = false;
        this.pwdError =
          err?.error?.error || "Failed to change password. Please try again.";
      },
    });
  }
}
