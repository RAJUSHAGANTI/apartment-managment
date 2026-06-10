import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
  template: `
    <div class="form-page">
      <mat-card>
        <mat-card-header><mat-card-title>Edit Profile</mat-card-title></mat-card-header>
        <mat-card-content>
          @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
          @else {
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="form-grid">
                <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput formControlName="first_name" required></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput formControlName="last_name" required></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email" type="email" required></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone"></mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="router.navigate(['/profile'])">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                  @if (saving()) { <mat-spinner diameter="20"></mat-spinner> } @else { Save Changes }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.form-page{max-width:600px;margin:0 auto}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-top:16px}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.center{display:flex;justify-content:center;padding:48px}`],
})
export class ProfileEditComponent implements OnInit {
  router = inject(Router);
  private api = inject(ApiService);
  private store = inject(AuthStore);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  loading = signal(true);
  saving = signal(false);

  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  ngOnInit(): void {
    this.api.get<any>('/auth/me').subscribe({
      next: r => { this.form.patchValue(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const userId = this.store.user()?.id;
    this.api.put<any>(`/users/${userId}`, this.form.value).subscribe({
      next: () => { this.notify.success('Profile updated'); this.router.navigate(['/profile']); },
      error: e => { this.notify.error(e.error?.message || 'Update failed'); this.saving.set(false); },
    });
  }
}
