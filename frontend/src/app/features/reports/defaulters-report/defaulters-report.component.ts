import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ReportService } from '../services/report.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-defaulters-report',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, MatChipsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Defaulters Report</h2>
        <div>
          <a mat-button routerLink="/reports"><mat-icon>arrow_back</mat-icon> Reports</a>
          <button mat-stroked-button (click)="exportPDF()"><mat-icon>picture_as_pdf</mat-icon> PDF</button>
          <button mat-stroked-button (click)="exportExcel()"><mat-icon>table_chart</mat-icon> Excel</button>
        </div>
      </div>

      @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
      @else if (data()) {
        <div class="kpi-row">
          <mat-card class="kpi warn"><div class="kpi-val">{{ data()?.totalDefaulters }}</div><div class="kpi-lbl">Defaulters</div></mat-card>
          <mat-card class="kpi warn"><div class="kpi-val">₹{{ data()?.totalOverdue | number }}</div><div class="kpi-lbl">Total Overdue</div></mat-card>
          <mat-card class="kpi warn"><div class="kpi-val">{{ data()?.overdueCount }}</div><div class="kpi-lbl">Overdue Bills</div></mat-card>
        </div>
        <mat-card>
          <mat-card-header><mat-card-title>Defaulters List</mat-card-title></mat-card-header>
          <table mat-table [dataSource]="data()?.defaulters ?? []">
            <ng-container matColumnDef="flat"><th mat-header-cell *matHeaderCellDef>Flat</th><td mat-cell *matCellDef="let d">{{ d.block_name }}-{{ d.flat_number }}</td></ng-container>
            <ng-container matColumnDef="tenant"><th mat-header-cell *matHeaderCellDef>Tenant</th><td mat-cell *matCellDef="let d">{{ d.tenant_name }}</td></ng-container>
            <ng-container matColumnDef="phone"><th mat-header-cell *matHeaderCellDef>Phone</th><td mat-cell *matCellDef="let d">{{ d.phone }}</td></ng-container>
            <ng-container matColumnDef="months"><th mat-header-cell *matHeaderCellDef>Months Due</th><td mat-cell *matCellDef="let d"><mat-chip color="warn" highlighted>{{ d.months_overdue }}</mat-chip></td></ng-container>
            <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Outstanding</th><td mat-cell *matCellDef="let d"><strong style="color:#f44336">₹{{ d.outstanding | number }}</strong></td></ng-container>
            <ng-container matColumnDef="oldest"><th mat-header-cell *matHeaderCellDef>Oldest Due</th><td mat-cell *matCellDef="let d">{{ d.oldest_due_date }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`.page{max-width:1200px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.page-header div{display:flex;gap:8px;align-items:center}.kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}.kpi{padding:20px;text-align:center}.kpi.warn .kpi-val{color:#f44336}.kpi-val{font-size:28px;font-weight:700;color:#3f51b5}.kpi-lbl{font-size:13px;color:#666;margin-top:4px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class DefaultersReportComponent implements OnInit {
  private svc = inject(ReportService);
  private notify = inject(NotificationService);

  data = signal<any>(null);
  loading = signal(true);
  cols = ['flat', 'tenant', 'phone', 'months', 'amount', 'oldest'];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getDefaulters().subscribe({ next: r => { this.data.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  exportPDF(): void {
    this.svc.exportPDF('defaulters').subscribe({ next: b => this.dl(b, 'defaulters.pdf', 'application/pdf'), error: () => this.notify.error('Failed') });
  }

  exportExcel(): void {
    this.svc.exportExcel('defaulters').subscribe({ next: b => this.dl(b, 'defaulters.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), error: () => this.notify.error('Failed') });
  }

  private dl(blob: Blob, name: string, type: string): void {
    const url = URL.createObjectURL(new Blob([blob], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }
}
