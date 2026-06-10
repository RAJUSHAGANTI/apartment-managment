import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule, MatListModule],
  template: `
    <div class="dashboard">
      <h2 class="page-title">Owner Dashboard</h2>
      @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
      @else if (data()) {
        <div class="grid">
          <mat-card>
            <mat-card-header><mat-card-title>My Apartments</mat-card-title></mat-card-header>
            <mat-card-content>
              @for (apt of data()?.apartments; track apt.id) {
                <div class="apt-item">
                  <mat-icon color="primary">apartment</mat-icon>
                  <div>
                    <div class="apt-name">{{ apt.block_name }}-{{ apt.flat_number }} ({{ apt.flat_type }})</div>
                    <div class="apt-meta">{{ apt.area_sqft }} sqft | ₹{{ apt.monthly_maintenance }}/month | {{ apt.status }}</div>
                  </div>
                </div>
              }
              @if (!data()?.apartments?.length) { <p class="empty">No apartments assigned</p> }
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header><mat-card-title>Pending Bills</mat-card-title></mat-card-header>
            <mat-card-content>
              @for (bill of data()?.pendingBills; track bill.id) {
                <div class="bill-item">
                  <div>{{ bill.block_name }}-{{ bill.flat_number }} | {{ bill.bill_month }}</div>
                  <mat-chip color="warn" highlighted>₹{{ bill.total_amount }}</mat-chip>
                </div>
              }
              @if (!data()?.pendingBills?.length) { <p class="empty">No pending bills</p> }
            </mat-card-content>
          </mat-card>

          <mat-card class="full-width">
            <mat-card-header><mat-card-title>Recent Notices</mat-card-title></mat-card-header>
            <mat-card-content>
              @for (n of data()?.notices; track n.id) {
                <mat-list-item>
                  <mat-icon matListItemIcon>{{ n.is_pinned ? 'push_pin' : 'notifications' }}</mat-icon>
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
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { grid-column: 1 / -1; }
    .apt-item, .bill-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #eee; }
    .apt-name { font-weight: 500; }
    .apt-meta { font-size: 13px; color: #666; }
    .bill-item { justify-content: space-between; }
    .empty { color: #999; font-style: italic; }
  `],
})
export class OwnerDashboardComponent implements OnInit {
  private api = inject(ApiService);
  loading = signal(true);
  data = signal<any>(null);

  ngOnInit(): void {
    this.api.get<any>('/dashboard/owner').subscribe({
      next: r => { this.data.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
