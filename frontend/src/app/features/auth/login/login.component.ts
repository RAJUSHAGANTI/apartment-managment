import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <mat-icon class="login-icon">domain</mat-icon>
            <h1>Apartment Management</h1>
            <p>Sign in to continue</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username or Email</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <input matInput formControlName="identifier" placeholder="Enter username or email" autocomplete="username">
              @if (form.get('identifier')?.hasError('required') && form.get('identifier')?.touched) {
                <mat-error>Username or email is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <mat-icon matPrefix>lock</mat-icon>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-checkbox formControlName="rememberMe" color="primary">Remember me</mat-checkbox>
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
            </div>

            @if (errorMessage()) {
              <div class="error-banner">{{ errorMessage() }}</div>
            }

            <button mat-raised-button color="primary" type="submit" class="full-width login-btn" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20" color="accent"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); }
    .login-card { width: 420px; padding: 24px; border-radius: 12px !important; box-shadow: 0 8px 40px rgba(0,0,0,0.2) !important; }
    .login-header { text-align: center; width: 100%; padding: 16px 0; }
    .login-icon { font-size: 48px; width: 48px; height: 48px; color: #1976d2; }
    .login-header h1 { margin: 8px 0 4px; font-size: 24px; color: #333; }
    .login-header p { color: #666; margin: 0; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .form-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .forgot-link { color: #1976d2; text-decoration: none; font-size: 14px; }
    .forgot-link:hover { text-decoration: underline; }
    .login-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .error-banner { background: #ffebee; color: #c62828; padding: 12px; border-radius: 4px; margin-bottom: 16px; font-size: 14px; }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private store = inject(AuthStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMessage.set('');

    const { identifier, password, rememberMe } = this.form.value;
    this.authService.login({ identifier: identifier!, password: password!, rememberMe: rememberMe ?? false })
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Invalid credentials. Please try again.');
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }
}
