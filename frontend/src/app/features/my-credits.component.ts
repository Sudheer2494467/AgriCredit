import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-my-credits',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTableModule, MatChipsModule, DecimalPipe],
  template: `
    <div class="my-credits-page">
      <div class="page-header">
        <div>
          <h2 class="page-title">💳 My Credits</h2>
          <p class="page-subtitle">All credit vouchers issued to you</p>
        </div>
        <div class="summary-chips">
          <div class="summary-chip">
            <span class="chip-label">Total Vouchers</span>
            <span class="chip-val">{{ vouchers.length }}</span>
          </div>
          <div class="summary-chip chip-warning">
            <span class="chip-label">Pending Approval</span>
            <span class="chip-val">{{ pendingCount }}</span>
          </div>
          <div class="summary-chip chip-primary">
            <span class="chip-label">Total Amount</span>
            <span class="chip-val">₹{{ totalAmount | number:'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <!-- Pending Approvals Banner -->
      <div *ngIf="pendingCount > 0" class="pending-banner glass-card">
        <div class="banner-left">
          <div class="banner-icon">
            <mat-icon>pending_actions</mat-icon>
          </div>
          <div class="banner-text">
            <strong>{{ pendingCount }} voucher(s) waiting for your approval!</strong>
            <span>Admin has created a credit entry that requires your confirmation.</span>
          </div>
        </div>
        <div class="pending-list">
          <div class="pending-item" *ngFor="let v of pendingVouchers">
            <div class="pending-info">
              <span class="pending-no">{{ v.voucherNo }}</span>
              <span class="pending-amt">₹{{ v.totalCreditAmount | number:'1.2-2' }}</span>
            </div>
            <div class="pending-items-preview">
              <span *ngFor="let item of v.items?.slice(0, 2)" class="item-pill">
                {{ item.product?.name || 'Cash' }} × {{ item.quantity }}
              </span>
              <span *ngIf="v.items?.length > 2" class="item-pill more">+{{ v.items.length - 2 }} more</span>
            </div>
            <div class="pending-actions">
              <button mat-raised-button color="primary" class="approve-btn" (click)="approve(v)" [disabled]="v.approving">
                <mat-icon>check_circle</mat-icon>
                {{ v.approving ? 'Approving...' : 'Approve' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Credit Vouchers Table -->
      <div class="section-card glass-card">
        <div class="section-header">
          <mat-icon>receipt_long</mat-icon>
          <span>Credit History</span>
          <span class="count-badge">{{ vouchers.length }}</span>
        </div>

        <div *ngIf="loading" class="loading-msg">
          <div class="mini-spinner"></div>
          Loading credit history...
        </div>

        <div *ngIf="!loading && vouchers.length === 0" class="empty-msg">
          <mat-icon>receipt</mat-icon>
          <span>No credit vouchers found</span>
        </div>

        <div class="voucher-list" *ngIf="!loading && vouchers.length > 0">
          <div class="voucher-card" *ngFor="let v of vouchers" [class]="'status-' + v.status">
            <div class="voucher-header">
              <div class="voucher-meta">
                <span class="voucher-no">{{ v.voucherNo }}</span>
                <span class="status-pill" [class]="'pill-' + v.status">{{ getStatusLabel(v.status) }}</span>
              </div>
              <div class="voucher-date">{{ formatDate(v.createdAt) }}</div>
            </div>

            <div class="voucher-items">
              <div class="item-row" *ngFor="let item of v.items">
                <div class="item-icon">
                  <mat-icon>{{ item.type === 'PRODUCT' ? 'inventory_2' : 'payments' }}</mat-icon>
                </div>
                <div class="item-desc">
                  <span class="item-name">{{ item.type === 'PRODUCT' ? item.product?.name : 'Cash Advance' }}</span>
                  <span class="item-detail" *ngIf="item.type === 'PRODUCT'">
                    {{ item.quantity }} × ₹{{ item.price | number:'1.2-2' }}
                  </span>
                </div>
                <div class="item-total">₹{{ item.total | number:'1.2-2' }}</div>
              </div>
            </div>

            <div class="voucher-footer">
              <div class="footer-row">
                <div class="footer-item" *ngIf="v.totalProductAmount > 0">
                  <span class="footer-label">Product</span>
                  <span class="footer-val">₹{{ v.totalProductAmount | number:'1.2-2' }}</span>
                </div>
                <div class="footer-item" *ngIf="v.totalCashAmount > 0">
                  <span class="footer-label">Cash</span>
                  <span class="footer-val">₹{{ v.totalCashAmount | number:'1.2-2' }}</span>
                </div>
                <div class="footer-item total">
                  <span class="footer-label">Total</span>
                  <span class="footer-val total-val">₹{{ v.totalCreditAmount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-credits-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title { margin: 0; font-size: 24px; font-weight: 700; color: var(--clr-text); }
    .page-subtitle { margin: 4px 0 0; color: var(--clr-text-muted); font-size: 13px; }

    .summary-chips {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .summary-chip {
      display: flex;
      flex-direction: column;
      padding: 12px 18px;
      border-radius: var(--radius-md);
      background: var(--clr-surface-alt);
      border: 1px solid var(--clr-border);
      min-width: 100px;
    }

    .chip-warning { border-color: var(--clr-warning); background: var(--clr-warning-soft); }
    .chip-primary { border-color: var(--clr-primary); background: var(--clr-primary-glow); }

    .chip-label { font-size: 10px; color: var(--clr-text-muted); font-weight: 600; text-transform: uppercase; }
    .chip-val { font-size: 20px; font-weight: 800; color: var(--clr-text); margin-top: 2px; }

    /* Pending Banner */
    .pending-banner {
      border: 1px solid var(--clr-warning);
      background: rgba(245, 158, 11, 0.05);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .banner-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .banner-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--clr-warning-soft);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .banner-icon mat-icon { color: var(--clr-warning); font-size: 24px; width: 24px; height: 24px; }

    .banner-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .banner-text strong { color: var(--clr-warning); font-size: 15px; }
    .banner-text span { color: var(--clr-text-muted); font-size: 13px; }

    .pending-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pending-item {
      background: var(--clr-surface-alt);
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-md);
      padding: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .pending-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }

    .pending-no { font-size: 13px; font-weight: 700; color: var(--clr-text); font-family: monospace; }
    .pending-amt { font-size: 18px; font-weight: 800; color: var(--clr-warning); }

    .pending-items-preview { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }

    .item-pill {
      padding: 3px 12px;
      border-radius: var(--radius-full);
      background: var(--clr-surface);
      border: 1px solid var(--clr-border);
      font-size: 11px;
      color: var(--clr-text-secondary);
    }

    .item-pill.more { background: var(--clr-primary-glow); color: var(--clr-primary-light); border-color: var(--clr-primary); }

    .pending-actions { margin-left: auto; }

    .approve-btn {
      background: linear-gradient(135deg, #22c55e, #16a34a) !important;
      color: white !important;
    }

    .approve-btn mat-icon { margin-right: 4px; font-size: 18px; width: 18px; height: 18px; }

    /* Section Card */
    .section-card { overflow: hidden; }

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

    .section-header mat-icon { color: var(--clr-primary-light); font-size: 20px; width: 20px; height: 20px; }

    .count-badge {
      margin-left: auto;
      font-size: 11px;
      padding: 2px 10px;
      border-radius: var(--radius-full);
      background: var(--clr-primary-glow);
      color: var(--clr-primary-light);
      font-weight: 600;
    }

    /* Loading */
    .loading-msg {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 32px;
      color: var(--clr-text-muted);
      font-size: 13px;
    }

    .mini-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--clr-border);
      border-top-color: var(--clr-primary-light);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .empty-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 40px;
      color: var(--clr-text-muted);
      font-size: 13px;
    }

    .empty-msg mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.3; }

    /* Voucher List */
    .voucher-list {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .voucher-card {
      border: 1px solid var(--clr-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--clr-surface-alt);
    }

    .voucher-card.status-PENDING_APPROVAL {
      border-color: var(--clr-warning);
    }

    .voucher-card.status-SETTLED {
      opacity: 0.7;
    }

    .voucher-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid var(--clr-border);
      background: rgba(0,0,0,0.15);
    }

    .voucher-meta { display: flex; align-items: center; gap: 10px; }

    .voucher-no { font-size: 13px; font-weight: 700; color: var(--clr-text); font-family: monospace; }

    .status-pill {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pill-CONFIRMED { background: var(--clr-success-soft); color: var(--clr-success); }
    .pill-PENDING_APPROVAL { background: var(--clr-warning-soft); color: var(--clr-warning); }
    .pill-SETTLED { background: var(--clr-info-soft); color: var(--clr-info); }

    .voucher-date { font-size: 12px; color: var(--clr-text-muted); }

    /* Items */
    .voucher-items { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }

    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .item-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: var(--clr-surface);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .item-icon mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--clr-primary-light); }

    .item-desc { flex: 1; display: flex; flex-direction: column; gap: 1px; }
    .item-name { font-size: 13px; font-weight: 600; color: var(--clr-text); }
    .item-detail { font-size: 11px; color: var(--clr-text-muted); }
    .item-total { font-size: 14px; font-weight: 700; color: var(--clr-text); }

    /* Footer */
    .voucher-footer { padding: 12px 16px; border-top: 1px solid var(--clr-border); }

    .footer-row { display: flex; gap: 16px; justify-content: flex-end; }

    .footer-item { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .footer-item.total { padding-left: 16px; border-left: 1px solid var(--clr-border); }

    .footer-label { font-size: 10px; color: var(--clr-text-muted); text-transform: uppercase; font-weight: 600; }
    .footer-val { font-size: 14px; font-weight: 700; color: var(--clr-text); }
    .total-val { color: var(--clr-primary-light); font-size: 16px; }
  `]
})
export class MyCreditsComponent implements OnInit {
  vouchers: any[] = [];
  pendingVouchers: any[] = [];
  loading = true;
  totalAmount = 0;
  pendingCount = 0;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    const farmerId = this.auth.getFarmerId();
    if (!farmerId) return;
    this.loadData(farmerId);
  }

  loadData(farmerId: number) {
    this.loading = true;
    this.api.farmerCredits(farmerId).subscribe({
      next: (vouchers) => {
        this.vouchers = vouchers;
        this.pendingVouchers = vouchers.filter((v: any) => v.status === 'PENDING_APPROVAL');
        this.pendingCount = this.pendingVouchers.length;
        this.totalAmount = vouchers
          .filter((v: any) => v.status !== 'PENDING_APPROVAL')
          .reduce((sum: number, v: any) => sum + (v.totalCreditAmount || 0), 0);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  approve(voucher: any) {
    voucher.approving = true;
    this.api.approveCredit(voucher.id).subscribe({
      next: () => {
        const farmerId = this.auth.getFarmerId();
        if (farmerId) this.loadData(farmerId);
      },
      error: () => { voucher.approving = false; }
    });
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'CONFIRMED': 'Confirmed',
      'PENDING_APPROVAL': 'Pending Approval',
      'SETTLED': 'Settled'
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
