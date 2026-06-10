import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <h2>Reports</h2>
      <div class="report-grid">
        <mat-card class="report-card" routerLink="/reports/maintenance">
          <mat-icon>receipt_long</mat-icon>
          <h3>Maintenance Report</h3>
          <p>Monthly collection, pending dues, payment status</p>
          <button mat-stroked-button color="primary">View Report</button>
        </mat-card>
        <mat-card class="report-card" routerLink="/reports/expenses">
          <mat-icon>account_balance_wallet</mat-icon>
          <h3>Expense Report</h3>
          <p>Category-wise expenses, monthly summaries</p>
          <button mat-stroked-button color="primary">View Report</button>
        </mat-card>
        <mat-card class="report-card" routerLink="/reports/occupancy">
          <mat-icon>apartment</mat-icon>
          <h3>Occupancy Report</h3>
          <p>Occupancy trends, vacant units, tenure history</p>
          <button mat-stroked-button color="primary">View Report</button>
        </mat-card>
        <mat-card class="report-card" routerLink="/reports/defaulters">
          <mat-icon>warning</mat-icon>
          <h3>Defaulters Report</h3>
          <p>Overdue bills, outstanding amounts, ageing</p>
          <button mat-stroked-button color="warn">View Report</button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`.page{max-width:1200px}h2{font-size:24px;font-weight:500;margin-bottom:24px}.report-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}.report-card{padding:24px;cursor:pointer;transition:box-shadow .2s;text-align:center}.report-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.15)}.report-card mat-icon{font-size:48px;width:48px;height:48px;color:#3f51b5;margin-bottom:16px}.report-card h3{font-size:18px;font-weight:500;margin:0 0 8px}.report-card p{color:#666;margin:0 0 16px;font-size:14px}`],
})
export class ReportsDashboardComponent {}
