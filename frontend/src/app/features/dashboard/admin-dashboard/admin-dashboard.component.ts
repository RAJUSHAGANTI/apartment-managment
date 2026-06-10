import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatTableModule, MatChipsModule, BaseChartDirective],
  template: `
    <div class="dashboard">
      <h2 class="page-title">Admin Dashboard</h2>

      @if (loading()) {
        <div class="loading-center"><mat-spinner></mat-spinner></div>
      } @else if (data()) {
        <!-- KPI Cards -->
        <div class="kpi-grid">
          <mat-card class="kpi-card">
            <mat-icon color="primary">apartment</mat-icon>
            <div class="kpi-value">{{ data()?.stats?.totalFlats }}</div>
            <div class="kpi-label">Total Flats</div>
          </mat-card>
          <mat-card class="kpi-card kpi-success">
            <mat-icon>check_circle</mat-icon>
            <div class="kpi-value">{{ data()?.stats?.occupiedFlats }}</div>
            <div class="kpi-label">Occupied</div>
          </mat-card>
          <mat-card class="kpi-card kpi-warn">
            <mat-icon>radio_button_unchecked</mat-icon>
            <div class="kpi-value">{{ data()?.stats?.vacantFlats }}</div>
            <div class="kpi-label">Vacant</div>
          </mat-card>
          <mat-card class="kpi-card">
            <mat-icon color="accent">people</mat-icon>
            <div class="kpi-value">{{ data()?.stats?.totalOwners }}</div>
            <div class="kpi-label">Owners</div>
          </mat-card>
          <mat-card class="kpi-card">
            <mat-icon color="primary">person</mat-icon>
            <div class="kpi-value">{{ data()?.stats?.totalTenants }}</div>
            <div class="kpi-label">Tenants</div>
          </mat-card>
          <mat-card class="kpi-card kpi-error">
            <mat-icon>pending_actions</mat-icon>
            <div class="kpi-value">{{ data()?.stats?.pendingBills?.count }}</div>
            <div class="kpi-label">Pending Bills</div>
            <div class="kpi-sub">₹{{ (data()?.stats?.pendingBills?.amount | number:'1.0-0') }}</div>
          </mat-card>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <mat-card class="chart-card">
            <mat-card-header><mat-card-title>Monthly Collection</mat-card-title></mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="barChartData()" [options]="barChartOptions" type="bar"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header><mat-card-title>Expense by Category</mat-card-title></mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="pieChartData()" [options]="pieChartOptions" type="pie"></canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Requests -->
        <mat-card class="recent-card">
          <mat-card-header><mat-card-title>Recent Maintenance Requests</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="data()?.recentRequests || []">
              <ng-container matColumnDef="flat">
                <th mat-header-cell *matHeaderCellDef>Flat</th>
                <td mat-cell *matCellDef="let r">{{ r.block_name }}-{{ r.flat_number }}</td>
              </ng-container>
              <ng-container matColumnDef="subject">
                <th mat-header-cell *matHeaderCellDef>Subject</th>
                <td mat-cell *matCellDef="let r">{{ r.subject }}</td>
              </ng-container>
              <ng-container matColumnDef="priority">
                <th mat-header-cell *matHeaderCellDef>Priority</th>
                <td mat-cell *matCellDef="let r">
                  <mat-chip [color]="r.priority === 'Emergency' ? 'warn' : 'primary'" highlighted>{{ r.priority }}</mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let r">{{ r.status }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['flat','subject','priority','status']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['flat','subject','priority','status']"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; }
    .page-title { font-size: 24px; font-weight: 500; margin-bottom: 24px; color: #333; }
    .loading-center { display: flex; justify-content: center; padding: 48px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { text-align: center; padding: 24px 16px !important; }
    .kpi-card mat-icon { font-size: 32px; width: 32px; height: 32px; margin-bottom: 8px; }
    .kpi-value { font-size: 32px; font-weight: 700; color: #333; }
    .kpi-label { font-size: 13px; color: #666; margin-top: 4px; }
    .kpi-sub { font-size: 12px; color: #999; }
    .kpi-success mat-icon { color: #388e3c; }
    .kpi-warn mat-icon { color: #f57c00; }
    .kpi-error mat-icon { color: #d32f2f; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .chart-card canvas { max-height: 280px; }
    .recent-card { margin-bottom: 24px; }
    table { width: 100%; }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);
  data = signal<any>(null);

  barChartOptions: ChartConfiguration['options'] = { responsive: true, scales: { y: { beginAtZero: true } } };
  pieChartOptions: ChartConfiguration['options'] = { responsive: true };

  barChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  pieChartData = signal<ChartData<'pie'>>({ labels: [], datasets: [] });

  ngOnInit(): void {
    this.api.get<any>('/dashboard/admin').subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.buildCharts(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildCharts(d: any): void {
    const months = d.monthlyCollection?.map((m: any) => m.bill_month) ?? [];
    this.barChartData.set({
      labels: months,
      datasets: [
        { label: 'Billed', data: d.monthlyCollection?.map((m: any) => m.billed) ?? [], backgroundColor: '#1976d2' },
        { label: 'Collected', data: d.monthlyCollection?.map((m: any) => m.collected) ?? [], backgroundColor: '#43a047' },
      ],
    });

    this.pieChartData.set({
      labels: d.expenseByCategory?.map((e: any) => e.category) ?? [],
      datasets: [{ data: d.expenseByCategory?.map((e: any) => e.total) ?? [] }],
    });
  }
}
