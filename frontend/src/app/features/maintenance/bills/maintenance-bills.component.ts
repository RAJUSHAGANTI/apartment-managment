import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MaintenanceService } from '../services/maintenance.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-maintenance-bills',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatChipsModule, MatPaginatorModule, MatTabsModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDialogModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Maintenance Bills</h2>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/maintenance/requests"><mat-icon>build</mat-icon> Requests</a>
          @if (store.isAdmin()) {
            <button mat-raised-button color="primary" (click)="generateBills()"><mat-icon>auto_awesome</mat-icon> Generate Bills</button>
          }
        </div>
      </div>

      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Month</mat-label>
            <input matInput [(ngModel)]="filters.bill_month" (ngModelChange)="loadData()" type="month">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filters.payment_status" (ngModelChange)="loadData()">
              <mat-option value="">All</mat-option>
              <mat-option value="Pending">Pending</mat-option>
              <mat-option value="Paid">Paid</mat-option>
              <mat-option value="Overdue">Overdue</mat-option>
              <mat-option value="Partial">Partial</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card>
        @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
        @else {
          <table mat-table [dataSource]="bills()">
            <ng-container matColumnDef="flat"><th mat-header-cell *matHeaderCellDef>Flat</th><td mat-cell *matCellDef="let b"><strong>{{ b.block_name }}-{{ b.flat_number }}</strong></td></ng-container>
            <ng-container matColumnDef="month"><th mat-header-cell *matHeaderCellDef>Month</th><td mat-cell *matCellDef="let b">{{ b.bill_month }}</td></ng-container>
            <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let b">₹{{ b.total_amount | number }}</td></ng-container>
            <ng-container matColumnDef="paid"><th mat-header-cell *matHeaderCellDef>Paid</th><td mat-cell *matCellDef="let b">₹{{ b.paid_amount | number }}</td></ng-container>
            <ng-container matColumnDef="due"><th mat-header-cell *matHeaderCellDef>Due Date</th><td mat-cell *matCellDef="let b">{{ b.due_date }}</td></ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let b">
                <mat-chip [color]="billColor(b.payment_status)" highlighted>{{ b.payment_status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let b">
                @if (store.isAdmin() && b.payment_status !== 'Paid') {
                  <button mat-icon-button color="primary" (click)="recordPayment(b)" matTooltip="Record Payment"><mat-icon>payments</mat-icon></button>
                }
                <button mat-icon-button (click)="viewReceipt(b)" matTooltip="Receipt"><mat-icon>receipt</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols"></tr>
          </table>
          <mat-paginator [length]="total()" [pageSize]="20" (page)="onPage($event)"></mat-paginator>
        }
      </mat-card>
    </div>
  `,
  styles: [`.page{max-width:1400px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.header-actions{display:flex;gap:8px}.filter-card{margin-bottom:16px;padding:16px!important}.filters{display:flex;gap:16px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class MaintenanceBillsComponent implements OnInit {
  store = inject(AuthStore);
  private svc = inject(MaintenanceService);
  private notify = inject(NotificationService);

  bills = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  filters: any = { bill_month: '', payment_status: '' };
  cols = ['flat', 'month', 'amount', 'paid', 'due', 'status', 'actions'];

  billColor(s: string) {
    return s === 'Paid' ? 'primary' : s === 'Pending' ? 'accent' : 'warn';
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getBills({ ...this.filters, page: this.page(), limit: 20 }).subscribe({
      next: r => { this.bills.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  generateBills(): void {
    const month = prompt('Bill month (YYYY-MM):');
    if (!month) return;
    const due = prompt('Due date (YYYY-MM-DD):');
    if (!due) return;
    this.svc.generateBills({ bill_month: month, due_date: due }).subscribe({
      next: r => { this.notify.success(`Generated: ${r.data.generated} bills`); this.loadData(); },
      error: e => this.notify.error(e.error?.message),
    });
  }

  recordPayment(bill: any): void {
    const amount = prompt(`Enter payment amount (total: ₹${bill.total_amount}):`);
    if (!amount) return;
    const mode = prompt('Payment mode (Cash/UPI/NEFT/IMPS/Online):') || 'Cash';
    this.svc.recordPayment(bill.id, { paid_amount: +amount, payment_mode: mode }).subscribe({
      next: () => { this.notify.success('Payment recorded'); this.loadData(); },
      error: e => this.notify.error(e.error?.message),
    });
  }

  viewReceipt(bill: any): void {
    alert(`Receipt: ${bill.receipt_number}\nFlat: ${bill.block_name}-${bill.flat_number}\nMonth: ${bill.bill_month}\nAmount: ₹${bill.total_amount}\nStatus: ${bill.payment_status}\nPaid: ₹${bill.paid_amount}`);
  }
}
