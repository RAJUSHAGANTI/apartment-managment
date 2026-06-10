import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

function passwordMatch(c: AbstractControl) {
  const p = c.get('new_password')?.value;
  const r = c.get('confirm_password')?.value;
  return p === r ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <div class="form-page">
      <mat-card>
        <mat-card-header><mat-card-title>Change Password</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="form-col">
              <mat-form-field appearance="outline">
                <mat-label>Current Password</mat-label>
                <input matInput [type]="show() ? 'text' : 'password'" formControlName="current_password" required>
                <button type="button" mat-icon-button matSuffix (click)="toggleShow()"><mat-icon>{{ show() ? 'visibility_off' : 'visibility' }}</mat-icon></button>
                @if (form.get('current_password')?.hasError('required') && form.get('current_password')?.touched) { <mat-error>Required</mat-error> }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>New Password</mat-label>
                <input matInput [type]="show() ? 'text' : 'password'" formControlName="new_password" required>
                @if (form.get('new_password')?.hasError('required') && form.get('new_password')?.touched) { <mat-error>Required</mat-error> }
                @if (form.get('new_password')?.hasError('minlength') && form.get('new_password')?.touched) { <mat-error>Min 8 characters</mat-error> }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Confirm New Password</mat-label>
                <input matInput [type]="show() ? 'text' : 'password'" formControlName="confirm_password" required>
                @if (form.hasError('mismatch') && form.get('confirm_password')?.touched) { <mat-error>Passwords do not match</mat-error> }
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="router.navigate(['/profile'])">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Update Password }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.form-page{max-width:480px;margin:0 auto}.form-col{display:flex;flex-direction:column;gap:0;margin-top:16px}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}`],
})
export class ChangePasswordComponent {
  router = inject(Router);
  private api = inject(ApiService);
  private store = inject(AuthStore);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  saving = signal(false);
  show = signal(false);
  toggleShow(): void { this.show.set(!this.show()); }

  form = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', Validators.required],
  }, { validators: passwordMatch });

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const userId = this.store.user()?.id;
    this.api.patch<any>(`/users/${userId}/password`, { current_password: this.form.value.current_password, new_password: this.form.value.new_password }).subscribe({
      next: () => { this.notify.success('Password changed'); this.router.navigate(['/profile']); },
      error: e => { this.notify.error(e.error?.message || 'Failed'); this.saving.set(false); },
    });
  }
}
