import { Component } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { AuthService } from "../core/auth.service";

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="login-wrapper">
      <!-- Animated background -->
      <div class="bg-grid"></div>
      <div class="bg-glow bg-glow--1"></div>
      <div class="bg-glow bg-glow--2"></div>
      <div class="bg-glow bg-glow--3"></div>

      <div class="login-content">
        <!-- Brand -->
        <div class="login-brand">
          <div class="brand-logo">🌾</div>
          <h1 class="brand-name">AgriLedger</h1>
          <p class="brand-tagline">Credit & Crop Settlement Platform</p>
        </div>

        <!-- Login Card -->
        <div class="login-card glass-card">
          <!-- Role Toggle -->
          <div class="role-tabs">
            <button
              type="button"
              class="role-tab"
              [class.active]="roleControl.value === 'ADMIN'"
              (click)="setAdmin()"
            >
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admin</span>
            </button>
            <button
              type="button"
              class="role-tab"
              [class.active]="roleControl.value === 'FARMER'"
              (click)="setFarmer()"
            >
              <mat-icon>agriculture</mat-icon>
              <span>Farmer</span>
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
            <div class="field-group">
              <label class="field-label">Username</label>
              <mat-form-field appearance="outline">
                <input
                  matInput
                  formControlName="username"
                  autocomplete="username"
                  placeholder="Enter username"
                />
              </mat-form-field>
            </div>

            <div class="field-group">
              <label class="field-label">Password</label>
              <mat-form-field appearance="outline">
                <input
                  matInput
                  type="password"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="Enter password"
                />
              </mat-form-field>
            </div>

            <button
              type="submit"
              mat-raised-button
              color="primary"
              class="login-btn"
              [disabled]="!form.valid || loading"
            >
              <span *ngIf="!loading">Sign In</span>
              <span *ngIf="loading">Signing in...</span>
            </button>

            <div *ngIf="error" class="error-msg">
              <mat-icon>error_outline</mat-icon>
              {{ error }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--clr-bg);
        position: relative;
        overflow: hidden;
        padding: 20px;
      }

      /* ── Animated Background ─────────────────── */
      .bg-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
        background-size: 60px 60px;
      }

      .bg-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.4;
        animation: float 8s ease-in-out infinite;
      }

      .bg-glow--1 {
        width: 400px;
        height: 400px;
        background: rgba(99, 102, 241, 0.3);
        top: -100px;
        right: -100px;
        animation-delay: 0s;
      }

      .bg-glow--2 {
        width: 300px;
        height: 300px;
        background: rgba(139, 92, 246, 0.25);
        bottom: -80px;
        left: -80px;
        animation-delay: -3s;
      }

      .bg-glow--3 {
        width: 200px;
        height: 200px;
        background: rgba(168, 85, 247, 0.2);
        top: 50%;
        left: 50%;
        animation-delay: -5s;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-20px) scale(1.05);
        }
      }

      /* ── Content ─────────────────────────────── */
      .login-content {
        width: 100%;
        max-width: 420px;
        position: relative;
        z-index: 1;
        animation: slideUp 0.6s var(--ease-out);
      }

      @keyframes slideUp {
        from {
          transform: translateY(30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      /* ── Brand ───────────────────────────────── */
      .login-brand {
        text-align: center;
        margin-bottom: 32px;
      }

      .brand-logo {
        width: 64px;
        height: 64px;
        display: inline-grid;
        place-items: center;
        border-radius: var(--radius-lg);
        background: var(--grad-primary);
        font-size: 32px;
        margin-bottom: 16px;
        box-shadow: var(--shadow-glow), var(--shadow-lg);
      }

      .brand-name {
        margin: 0;
        font-size: 32px;
        font-weight: 800;
        color: var(--clr-text);
        letter-spacing: -0.5px;
      }

      .brand-tagline {
        margin: 6px 0 0;
        font-size: 14px;
        color: var(--clr-text-muted);
      }

      /* ── Card ─────────────────────────────────── */
      .login-card {
        padding: 0;
        overflow: hidden;
      }

      /* ── Role Tabs ───────────────────────────── */
      .role-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-bottom: 1px solid var(--clr-border);
      }

      .role-tab {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        border: none;
        background: transparent;
        color: var(--clr-text-muted);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--duration-normal) var(--ease-out);
        position: relative;
        font-family: inherit;
      }

      .role-tab:hover {
        color: var(--clr-text-secondary);
        background: rgba(99, 102, 241, 0.05);
      }

      .role-tab.active {
        color: var(--clr-primary-light);
        background: rgba(99, 102, 241, 0.08);
      }

      .role-tab.active::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 16px;
        right: 16px;
        height: 2px;
        background: var(--grad-primary);
        border-radius: 2px;
      }

      .role-tab mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* ── Form ─────────────────────────────────── */
      .login-form {
        display: flex;
        flex-direction: column;
        padding: 28px;
        gap: 20px;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--clr-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .login-btn {
        height: 48px;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        border-radius: var(--radius-sm) !important;
        background: var(--grad-primary) !important;
        color: white !important;
        transition: all var(--duration-normal) var(--ease-out);
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3) !important;
      }

      .login-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4) !important;
      }

      .error-msg {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: var(--clr-danger-soft);
        color: var(--clr-danger);
        border-radius: var(--radius-sm);
        font-size: 13px;
      }

      .error-msg mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
})
export class LoginComponent {
  roleControl = this.fb.control("ADMIN");
  form = this.fb.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });
  loading = false;
  error = "";

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    
    if (this.auth.isAuthenticated() && this.auth.getRole()) {
      if (this.auth.isAdmin()) {
        this.router.navigate(["/admindashboard"]);
      } else {
        this.router.navigate(["/farmer-dashboard"]);
      }
    }
  }

  setAdmin() {
    this.roleControl.setValue("ADMIN");
    this.form.patchValue({ username: "", password: "" });
    this.error = "";
  }

  setFarmer() {
    this.roleControl.setValue("FARMER");
    this.form.patchValue({ username: "", password: "" });
    this.error = "";
  }

  submit() {
    this.loading = true;
    this.error = "";
    const v = this.form.value;
    this.auth.login(v.username!, v.password!).subscribe({
      next: () => {
        this.loading = false;
       
        if (this.auth.isAdmin()) {
          this.router.navigate(["/admindashboard"]);
        } else {
          this.router.navigate(["/farmer-dashboard"]);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.error || "Login failed. Please check credentials.";
      },
    });
  }
}
