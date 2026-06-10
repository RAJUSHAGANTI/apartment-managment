import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ReportService } from '../services/report.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-maintenance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, MatProgressSpinnerModule, MatChipsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Maintenance Report</h2>
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
          <mat-card class="kpi"><div class="kpi-val">₹{{ data()?.totalCollection | number }}</div><div class="kpi-lbl">Total Collected</div></mat-card>
          <mat-card class="kpi"><div class="kpi-val">₹{{ data()?.totalPending | number }}</div><div class="kpi-lbl">Total Pending</div></mat-card>
          <mat-card class="kpi"><div class="kpi-val">{{ data()?.paidCount }}</div><div class="kpi-lbl">Paid Bills</div></mat-card>
          <mat-card class="kpi"><div class="kpi-val">{{ data()?.overdueCount }}</div><div class="kpi-lbl">Overdue Bills</div></mat-card>
        </div>
        <mat-card>
          <mat-card-header><mat-card-title>Bill Details</mat-card-title></mat-card-header>
          <table mat-table [dataSource]="data()?.bills ?? []">
            <ng-container matColumnDef="flat"><th mat-header-cell *matHeaderCellDef>Flat</th><td mat-cell *matCellDef="let b">{{ b.block_name }}-{{ b.flat_number }}</td></ng-container>
            <ng-container matColumnDef="month"><th mat-header-cell *matHeaderCellDef>Month</th><td mat-cell *matCellDef="let b">{{ b.bill_month }}</td></ng-container>
            <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let b">₹{{ b.total_amount | number }}</td></ng-container>
            <ng-container matColumnDef="paid"><th mat-header-cell *matHeaderCellDef>Paid</th><td mat-cell *matCellDef="let b">₹{{ b.paid_amount | number }}</td></ng-container>
            <ng-container matColumnDef="due"><th mat-header-cell *matHeaderCellDef>Due Date</th><td mat-cell *matCellDef="let b">{{ b.due_date }}</td></ng-container>
            <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let b"><mat-chip [color]="b.payment_status === 'Paid' ? 'primary' : 'warn'" highlighted>{{ b.payment_status }}</mat-chip></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`.page{max-width:1400px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.filter-card{margin-bottom:16px;padding:16px!important}.filters{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px}.kpi{padding:20px;text-align:center}.kpi-val{font-size:28px;font-weight:700;color:#3f51b5}.kpi-lbl{font-size:13px;color:#666;margin-top:4px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class MaintenanceReportComponent implements OnInit {
  private svc = inject(ReportService);
  private notify = inject(NotificationService);

  data = signal<any>(null);
  loading = signal(false);
  filters: any = { from: '', to: '' };
  cols = ['flat', 'month', 'amount', 'paid', 'due', 'status'];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getMaintenance(this.filters).subscribe({
      next: r => { this.data.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  exportPDF(): void {
    this.svc.exportPDF('maintenance', this.filters).subscribe({
      next: blob => this.downloadFile(blob, 'maintenance-report.pdf', 'application/pdf'),
      error: () => this.notify.error('Export failed'),
    });
  }

  exportExcel(): void {
    this.svc.exportExcel('maintenance', this.filters).subscribe({
      next: blob => this.downloadFile(blob, 'maintenance-report.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      error: () => this.notify.error('Export failed'),
    });
  }

  private downloadFile(blob: Blob, name: string, type: string): void {
    const url = URL.createObjectURL(new Blob([blob], { type }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }
}
