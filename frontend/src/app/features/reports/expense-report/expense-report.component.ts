import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../services/report.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-expense-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatTableModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Expense Report</h2>
        <a mat-button routerLink="/reports"><mat-icon>arrow_back</mat-icon> Reports</a>
      </div>
      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>From Month</mat-label><input matInput [(ngModel)]="filters.from" type="month"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>To Month</mat-label><input matInput [(ngModel)]="filters.to" type="month"></mat-form-field>
          <button mat-raised-button color="primary" (click)="loadData()"><mat-icon>search</mat-icon> Generate</button>
          <button mat-stroked-button (click)="exportPDF()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          <button mat-stroked-button (click)="exportExcel()"><mat-icon>table_chart</mat-icon> Excel</button>
        </div>
      </mat-card>

      @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
      @else if (data()) {
        <div class="kpi-row">
          <mat-card class="kpi"><div class="kpi-val">₹{{ data()?.totalExpenses | number }}</div><div class="kpi-lbl">Total Expenses</div></mat-card>
          <mat-card class="kpi"><div class="kpi-val">{{ data()?.approvedCount }}</div><div class="kpi-lbl">Approved</div></mat-card>
          <mat-card class="kpi"><div class="kpi-val">{{ data()?.pendingCount }}</div><div class="kpi-lbl">Pending</div></mat-card>
        </div>
        <mat-card>
          <mat-card-header><mat-card-title>By Category</mat-card-title></mat-card-header>
          <table mat-table [dataSource]="data()?.byCategory ?? []">
            <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let r">{{ r.category_name }}</td></ng-container>
            <ng-container matColumnDef="count"><th mat-header-cell *matHeaderCellDef>Count</th><td mat-cell *matCellDef="let r">{{ r.count }}</td></ng-container>
            <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let r"><strong>₹{{ r.total | number }}</strong></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`.page{max-width:1200px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.filter-card{margin-bottom:16px;padding:16px!important}.filters{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}.kpi{padding:20px;text-align:center}.kpi-val{font-size:28px;font-weight:700;color:#3f51b5}.kpi-lbl{font-size:13px;color:#666;margin-top:4px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class ExpenseReportComponent implements OnInit {
  private svc = inject(ReportService);
  private notify = inject(NotificationService);

  data = signal<any>(null);
  loading = signal(false);
  filters: any = { from: '', to: '' };
  cols = ['category', 'count', 'amount'];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getExpenses(this.filters).subscribe({
      next: r => { this.data.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  exportPDF(): void {
    this.svc.exportPDF('expenses', this.filters).subscribe({
      next: blob => this.download(blob, 'expense-report.pdf', 'application/pdf'),
      error: () => this.notify.error('Export failed'),
    });
  }

  exportExcel(): void {
    this.svc.exportExcel('expenses', this.filters).subscribe({
      next: blob => this.download(blob, 'expense-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      error: () => this.notify.error('Export failed'),
    });
  }

  private download(blob: Blob, name: string, type: string): void {
    const url = URL.createObjectURL(new Blob([blob], { type }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }
}
