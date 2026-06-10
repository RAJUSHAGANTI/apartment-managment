import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <mat-card class="card">
        <mat-card-header>
          <div class="header">
            <mat-icon>lock_reset</mat-icon>
            <h2>Reset Password</h2>
            <p>Enter your email to receive a reset link</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          @if (!sent()) {
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email Address</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput formControlName="email" type="email">
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="loading()">
                {{ loading() ? 'Sending...' : 'Send Reset Link' }}
              </button>
            </form>
          } @else {
            <div class="success-msg">
              <mat-icon color="primary">check_circle</mat-icon>
              <p>If that email exists, a reset link has been sent.</p>
              @if (devToken()) {
                <p class="dev-token"><strong>Dev token:</strong> {{ devToken() }}</p>
              }
            </div>
          }
          <a routerLink="/auth/login" class="back-link">← Back to Login</a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1976d2, #1565c0); }
    .card { width: 400px; padding: 24px; }
    .header { text-align: center; width: 100%; }
    .header mat-icon { font-size: 48px; width: 48px; height: 48px; color: #1976d2; }
    .full-width { width: 100%; }
    .back-link { display: block; text-align: center; margin-top: 16px; color: #1976d2; text-decoration: none; }
    .success-msg { text-align: center; padding: 16px; }
    .success-msg mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .dev-token { background: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all; }
  `],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = signal(false);
  sent = signal(false);
  devToken = signal('');

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.sent.set(true);
        if (res.data?.resetToken) this.devToken.set(res.data.resetToken);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }
}
