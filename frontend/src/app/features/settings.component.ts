import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">Store Settings</h2>
        <p class="page-subtitle">Configure interest rates and other system defaults.</p>
      </div>

      <mat-card class="settings-card glass-card">
        <div class="card-header">
          <mat-icon>tune</mat-icon>
          <span>Interest Configuration</span>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="save()" class="settings-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Interest Rate (% per month)</mat-label>
              <input matInput type="number" step="0.1" formControlName="productInterestRate">
              <mat-icon matSuffix>percent</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cash Advance Interest Rate (% per month)</mat-label>
              <input matInput type="number" step="0.1" formControlName="cashInterestRate">
              <mat-icon matSuffix>percent</mat-icon>
            </mat-form-field>
          </div>
          
          <div class="form-actions">
            <span class="success-msg" *ngIf="successMsg">{{ successMsg }}</span>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isSaving">
              <mat-icon>save</mat-icon>
              {{ isSaving ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px;
      color: var(--clr-text);
    }

    .page-subtitle {
      color: var(--clr-text-muted);
      margin: 0;
    }

    .settings-card {
      padding: 32px;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 600;
      color: var(--clr-text);
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--clr-border);
    }
    
    .card-header mat-icon {
      color: var(--clr-primary-light);
    }
    
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
    }
    
    .success-msg {
      color: var(--clr-success);
      font-weight: 500;
      font-size: 14px;
    }
  `]
})
export class SettingsComponent implements OnInit {
  form = this.fb.group({
    productInterestRate: [2.0, [Validators.required, Validators.min(0)]],
    cashInterestRate: [2.0, [Validators.required, Validators.min(0)]]
  });
  
  isSaving = false;
  successMsg = '';

  constructor(private fb: FormBuilder, private api: ApiService) {}

  ngOnInit() {
    this.api.getSettings().subscribe(res => {
      if (res) {
        this.form.patchValue({
          productInterestRate: res.productInterestRate,
          cashInterestRate: res.cashInterestRate
        });
      }
    });
  }

  save() {
    if (this.form.valid) {
      this.isSaving = true;
      this.successMsg = '';
      this.api.updateSettings(this.form.value).subscribe({
        next: () => {
          this.isSaving = false;
          this.successMsg = 'Settings saved successfully!';
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: () => {
          this.isSaving = false;
        }
      });
    }
  }
}
