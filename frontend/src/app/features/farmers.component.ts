import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { ApiService } from "../core/api.service";
import { Farmer } from "../core/models";

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    CommonModule,
  ],
  template: `
    <h2 class="page-title">Farmer Management</h2>

    <!-- Add Farmer Form -->
    <div class="form-card glass-card">
      <div class="form-card-header">
        <mat-icon>person_add</mat-icon>
        <span>{{ editMode ? "Edit Farmer" : "Add New Farmer" }}</span>
      </div>
      <form [formGroup]="form" (ngSubmit)="save()" class="farmer-form">
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label">Full Name</label>
            <mat-form-field appearance="outline">
              <input
                matInput
                formControlName="name"
                placeholder="Enter farmer name"
              />
            </mat-form-field>
          </div>
          <div class="field-group">
            <label class="field-label">Phone</label>
            <mat-form-field appearance="outline">
              <input
                matInput
                formControlName="phone"
                placeholder="Enter phone"
              />
            </mat-form-field>
          </div>
          <div class="field-group">
            <label class="field-label">Village</label>
            <mat-form-field appearance="outline">
              <input
                matInput
                formControlName="village"
                placeholder="Enter village"
              />
            </mat-form-field>
          </div>
          <div class="field-group">
            <label class="field-label">Land (Acres)</label>
            <mat-form-field appearance="outline">
              <input
                matInput
                type="number"
                formControlName="landAcres"
                placeholder="0"
              />
            </mat-form-field>
          </div>
        </div>
        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit">
            <mat-icon>{{ editMode ? "save" : "add" }}</mat-icon>
            {{ editMode ? "Update" : "Add Farmer" }}
          </button>
          <button
            *ngIf="editMode"
            mat-button
            type="button"
            (click)="cancelEdit()"
            class="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Search -->
    <div class="search-bar glass-card">
      <mat-icon class="search-icon">search</mat-icon>
      <input
        class="search-input"
        placeholder="Search farmers by name, phone, or village..."
        (input)="load($any($event.target).value)"
      />
    </div>

    <!-- Table -->
    <div class="table-wrap" *ngIf="farmers.length > 0; else emptyState">
      <table mat-table [dataSource]="farmers">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Farmer</th>
          <td mat-cell *matCellDef="let f">
            <div class="farmer-cell">
              <div class="farmer-avatar">
                {{ f.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="farmer-info">
                <span class="farmer-name">{{ f.name }}</span>
                <span class="farmer-meta">{{ f.village }} · {{ f.phone }}</span>
              </div>
            </div>
          </td>
        </ng-container>
        <ng-container matColumnDef="land">
          <th mat-header-cell *matHeaderCellDef>Land</th>
          <td mat-cell *matCellDef="let f">
            <span class="land-badge">{{ f.landAcres }} acres</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="bal">
          <th mat-header-cell *matHeaderCellDef>Balance</th>
          <td mat-cell *matCellDef="let f">
            <span
              class="balance"
              [class.positive]="f.currentBalance > 0"
              [class.zero]="f.currentBalance === 0"
            >
              ₹{{ f.currentBalance | number: "1.2-2" }}
            </span>
          </td>
        </ng-container>
        <ng-container matColumnDef="risk">
          <th mat-header-cell *matHeaderCellDef>Risk Score</th>
          <td mat-cell *matCellDef="let f">
            <span
              class="risk-badge"
              [ngStyle]="{
                'background-color': getRiskColor(f) + '20',
                color: getRiskColor(f),
              }"
            >
              {{ getRiskLevel(f) }}
            </span>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let f">
            <button
              mat-icon-button
              (click)="edit(f)"
              class="action-btn edit-btn"
              title="Edit"
            >
              <mat-icon>edit</mat-icon>
            </button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>
      </table>
    </div>

    <ng-template #emptyState>
      <div class="empty-state glass-card">
        <span class="empty-icon">👨‍🌾</span>
        <span class="empty-title">No farmers found</span>
        <span class="empty-desc"
          >Add your first farmer using the form above</span
        >
      </div>
    </ng-template>

    <!-- Credential Modal (shown after farmer creation) -->
    <div
      class="cred-overlay"
      *ngIf="createdCredentials"
      (click)="createdCredentials = null"
    >
      <div class="cred-modal glass-card" (click)="$event.stopPropagation()">
        <div class="cred-header">
          <mat-icon style="color: var(--clr-success)">check_circle</mat-icon>
          <span>Farmer Added Successfully!</span>
        </div>
        <p class="cred-intro">
          Share these login credentials with
          <strong>{{ createdCredentials.name }}</strong
          >:
        </p>
        <div class="cred-row">
          <span class="cred-label">Username</span>
          <code class="cred-value">{{ createdCredentials.loginUsername }}</code>
        </div>
        <div class="cred-row">
          <span class="cred-label">Password</span>
          <code class="cred-value">{{ createdCredentials.loginPassword }}</code>
        </div>
        <p class="cred-note">
          ⚠️ Save this now. The password is shown only once!
        </p>
        <button
          mat-raised-button
          color="primary"
          (click)="createdCredentials = null"
        >
          Got it, Saved!
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .form-card {
        padding: 0;
        margin-bottom: 20px;
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

      .farmer-form {
        padding: 24px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--clr-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .form-actions button[mat-raised-button] {
        background: var(--grad-primary) !important;
        color: white !important;
      }

      .cancel-btn {
        color: var(--clr-text-secondary) !important;
      }

      /* Search */
      .search-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 18px;
        margin-bottom: 20px;
      }

      .search-icon {
        color: var(--clr-text-muted);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .search-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: var(--clr-text);
        font-size: 14px;
        font-family: inherit;
      }

      .search-input::placeholder {
        color: var(--clr-text-muted);
      }

      /* Table cells */
      .farmer-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .farmer-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--grad-primary);
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
      }

      .farmer-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .farmer-name {
        font-weight: 600;
        color: var(--clr-text);
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .farmer-meta {
        font-size: 11px;
        color: var(--clr-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .land-badge {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        background: var(--clr-info-soft);
        color: var(--clr-info);
        font-weight: 500;
      }

      .balance {
        font-weight: 600;
        font-size: 13px;
      }

      .balance.positive {
        color: var(--clr-warning);
      }

      .balance.zero {
        color: var(--clr-success);
      }

      .risk-badge {
        font-size: 10px;
        padding: 4px 8px;
        border-radius: var(--radius-full);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .action-btn {
        width: 32px !important;
        height: 32px !important;
        line-height: 32px !important;
      }

      .action-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .edit-btn {
        color: var(--clr-primary-light) !important;
      }

      .delete-btn {
        color: var(--clr-danger) !important;
      }

      /* Empty state */
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

      /* Credential Modal */
      .cred-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.2s ease;
      }

      .cred-modal {
        padding: 32px;
        max-width: 440px;
        width: 90%;
        border: 2px solid var(--clr-success) !important;
      }

      .cred-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 700;
        color: var(--clr-text);
        margin-bottom: 16px;
      }

      .cred-intro {
        color: var(--clr-text-secondary);
        font-size: 14px;
        margin-bottom: 20px;
      }

      .cred-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--clr-border);
        margin-bottom: 4px;
      }

      .cred-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--clr-text-muted);
        text-transform: uppercase;
      }

      .cred-value {
        font-family: "SF Mono", "Fira Code", monospace;
        font-size: 13px;
        background: var(--clr-success-soft);
        color: var(--clr-success);
        padding: 4px 12px;
        border-radius: var(--radius-sm);
        font-weight: 700;
      }

      .cred-note {
        font-size: 12px;
        color: var(--clr-warning);
        margin: 16px 0;
        padding: 8px 12px;
        background: var(--clr-warning-soft);
        border-radius: var(--radius-sm);
      }
    `,
  ],
})
export class FarmersComponent implements OnInit {
  cols = ["name", "land", "bal", "risk", "actions"];
  farmers: Farmer[] = [];
  editMode = false;
  form = this.fb.group({
    id: [0],
    name: [""],
    phone: [""],
    village: [""],
    landAcres: [0],
  });

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(q = ""): void {
    this.api.farmers(q).subscribe((r) => (this.farmers = r));
  }

  createdCredentials: any = null;

  save(): void {
    const payload = this.form.value as any;
    this.api.saveFarmer(payload).subscribe((res: any) => {
      this.form.reset({ id: 0, landAcres: 0 });
      this.editMode = false;
      this.load();
      // Show credential popup only when creating a NEW farmer
      if (!payload.id && res?.loginUsername) {
        this.createdCredentials = res;
      }
    });
  }

  edit(farmer: Farmer): void {
    this.editMode = true;
    this.form.patchValue(farmer as any);
  }

  cancelEdit(): void {
    this.editMode = false;
    this.form.reset({ id: 0, landAcres: 0 });
  }



  getRiskScore(farmer: Farmer): number {
    if (!farmer.currentBalance || farmer.currentBalance <= 0) return 0;
    const landAcres = farmer.landAcres || 0;
    if (landAcres === 0) return 999; 

    return farmer.currentBalance / (landAcres * 10000);
  }

  getRiskLevel(farmer: Farmer): string {
    const score = this.getRiskScore(farmer);
    if (score === 0) return "LOW";
    if (score < 0.5) return "LOW";
    if (score < 1.0) return "MEDIUM";
    if (score < 2.0) return "HIGH";
    return "CRITICAL";
  }

  getRiskColor(farmer: Farmer): string {
    const score = this.getRiskScore(farmer);
    if (score === 0 || score < 0.5) return "#22c55e"; // success
    if (score < 1.0) return "#f59e0b"; // warning
    if (score < 2.0) return "#f97316"; // orange
    return "#ef4444"; // danger
  }
}
