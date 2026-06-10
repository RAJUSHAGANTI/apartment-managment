import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStore } from '../../../core/auth/auth.store';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatDividerModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>My Profile</h2>
        <div>
          <a mat-stroked-button routerLink="/profile/edit"><mat-icon>edit</mat-icon> Edit</a>
          <a mat-stroked-button routerLink="/profile/password"><mat-icon>lock</mat-icon> Change Password</a>
        </div>
      </div>
      @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
      @else if (profile()) {
        <div class="profile-layout">
          <mat-card class="avatar-card">
            <div class="avatar">{{ initials() }}</div>
            <h3>{{ store.fullName() }}</h3>
            <p class="role-badge">{{ store.role() }}</p>
          </mat-card>
          <mat-card class="details-card">
            <mat-card-header><mat-card-title>Account Details</mat-card-title></mat-card-header>
            <mat-card-content>
              <div class="field"><span class="lbl">Username</span><span>{{ profile()?.username }}</span></div>
              <mat-divider></mat-divider>
              <div class="field"><span class="lbl">Email</span><span>{{ profile()?.email }}</span></div>
              <mat-divider></mat-divider>
              <div class="field"><span class="lbl">First Name</span><span>{{ profile()?.first_name }}</span></div>
              <mat-divider></mat-divider>
              <div class="field"><span class="lbl">Last Name</span><span>{{ profile()?.last_name }}</span></div>
              <mat-divider></mat-divider>
              <div class="field"><span class="lbl">Phone</span><span>{{ profile()?.phone || '-' }}</span></div>
              <mat-divider></mat-divider>
              <div class="field"><span class="lbl">Role</span><span>{{ profile()?.role }}</span></div>
              <mat-divider></mat-divider>
              <div class="field"><span class="lbl">Status</span><span>{{ profile()?.is_active ? 'Active' : 'Inactive' }}</span></div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`.page{max-width:900px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}.page-header h2{font-size:24px;font-weight:500;margin:0}.page-header div{display:flex;gap:8px}.profile-layout{display:grid;grid-template-columns:250px 1fr;gap:16px}.avatar-card{padding:32px;text-align:center}.avatar{width:80px;height:80px;border-radius:50%;background:#3f51b5;color:#fff;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:500;margin:0 auto 16px}.role-badge{background:#e8eaf6;color:#3f51b5;border-radius:12px;padding:4px 12px;display:inline-block;font-size:13px;margin:0}.field{display:flex;justify-content:space-between;padding:12px 0}.lbl{font-weight:500;color:#666}.center{display:flex;justify-content:center;padding:48px}h3{margin:0 0 8px;font-size:18px}`],
})
export class ProfileViewComponent implements OnInit {
  store = inject(AuthStore);
  private api = inject(ApiService);

  profile = signal<any>(null);
  loading = signal(true);

  initials(): string {
    const u = this.store.user();
    if (!u) return '?';
    return `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase();
  }

  ngOnInit(): void {
    this.api.get<any>('/auth/me').subscribe({
      next: r => { this.profile.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
