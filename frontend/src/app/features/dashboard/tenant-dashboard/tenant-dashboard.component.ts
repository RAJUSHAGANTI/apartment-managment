import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, MatListModule],
  template: `
    <div class="dashboard">
      <h2 class="page-title">My Dashboard</h2>
      @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
      @else if (data()) {
        <!-- Alert banner -->
        @for (alert of data()?.alerts; track alert.id) {
          <div class="alert-banner" [class.warn]="alert.severity === 'Warning'" [class.critical]="alert.severity === 'Critical'">
            <mat-icon>warning</mat-icon>
            <strong>{{ alert.title }}:</strong> {{ alert.message }}
          </div>
        }

        <div class="grid">
          <!-- Current Flat -->
          <mat-card>
            <mat-card-header><mat-card-title>My Flat</mat-card-title></mat-card-header>
            <mat-card-content>
              @if (data()?.apartment) {
                <div class="info-row"><mat-icon>apartment</mat-icon><span>{{ data().apartment.block_name }}-{{ data().apartment.flat_number }}</span></div>
                <div class="info-row"><mat-icon>straighten</mat-icon><span>{{ data().apartment.area_sqft }} sqft | {{ data().apartment.flat_type }}</span></div>
                <div class="info-row"><mat-icon>payments</mat-icon><span>Rent: ₹{{ data().tenant?.rent_amount }}/month</span></div>
                <div class="info-row"><mat-icon>calendar_today</mat-icon><span>Move-in: {{ data().tenant?.move_in_date }}</span></div>
              } @else { <p class="empty">No flat assigned</p> }
            </mat-card-content>
          </mat-card>

          <!-- Bills -->
          <mat-card>
            <mat-card-header><mat-card-title>Recent Bills</mat-card-title></mat-card-header>
            <mat-card-content>
              @for (bill of data()?.bills; track bill.id) {
                <div class="bill-row">
                  <span>{{ bill.bill_month }}</span>
                  <span>₹{{ bill.total_amount }}</span>
                  <mat-chip [color]="bill.payment_status === 'Paid' ? 'primary' : 'warn'" highlighted>{{ bill.payment_status }}</mat-chip>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Notices -->
          <mat-card class="full-width">
            <mat-card-header><mat-card-title>Notices</mat-card-title></mat-card-header>
            <mat-card-content>
              @for (n of data()?.notices; track n.id) {
                <mat-list-item>
                  <mat-icon matListItemIcon>notifications</mat-icon>
                  <div matListItemTitle>{{ n.title }}</div>
                  <div matListItemLine>{{ n.publish_date }}</div>
                </mat-list-item>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }
    .page-title { font-size: 24px; font-weight: 500; margin-bottom: 24px; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
    .full-width { grid-column: 1 / -1; }
    .info-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
    .bill-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .empty { color: #999; }
    .alert-banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 4px; margin-bottom: 12px; background: #fff3e0; color: #e65100; }
    .alert-banner.warn { background: #fff3e0; }
    .alert-banner.critical { background: #ffebee; color: #c62828; }
  `],
})
export class TenantDashboardComponent implements OnInit {
  private api = inject(ApiService);
  loading = signal(true);
  data = signal<any>(null);

  ngOnInit(): void {
    this.api.get<any>('/dashboard/tenant').subscribe({
      next: r => { this.data.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
