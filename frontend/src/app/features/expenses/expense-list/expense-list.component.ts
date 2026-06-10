import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExpenseService } from '../services/expense.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Expenses</h2>
        @if (store.isAdmin()) {
          <button mat-raised-button color="primary" (click)="router.navigate(['/expenses/new'])"><mat-icon>add</mat-icon> Add Expense</button>
        }
      </div>
      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>Month</mat-label><input matInput [(ngModel)]="filters.month_year" (ngModelChange)="loadData()" type="month"></mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="filters.category_id" (ngModelChange)="loadData()">
              <mat-option value="">All</mat-option>
              @for (c of categories(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filters.approval_status" (ngModelChange)="loadData()">
              <mat-option value="">All</mat-option>
              <mat-option value="Pending">Pending</mat-option>
              <mat-option value="Approved">Approved</mat-option>
              <mat-option value="Rejected">Rejected</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>
      <mat-card>
        @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
        @else {
          <table mat-table [dataSource]="expenses()">
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let e">{{ e.expense_date }}</td></ng-container>
            <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let e">{{ e.category_name }}</td></ng-container>
            <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Title</th><td mat-cell *matCellDef="let e">{{ e.title }}</td></ng-container>
            <ng-container matColumnDef="amount"><th mat-header-cell *matHeaderCellDef>Amount</th><td mat-cell *matCellDef="let e"><strong>₹{{ e.amount | number }}</strong></td></ng-container>
            <ng-container matColumnDef="vendor"><th mat-header-cell *matHeaderCellDef>Vendor</th><td mat-cell *matCellDef="let e">{{ e.vendor_name }}</td></ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e"><mat-chip [color]="e.approval_status === 'Approved' ? 'primary' : e.approval_status === 'Rejected' ? 'warn' : 'accent'" highlighted>{{ e.approval_status }}</mat-chip></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                @if (store.isAdmin()) {
                  <button mat-icon-button color="primary" [routerLink]="['/expenses', e.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                  @if (e.approval_status === 'Pending') {
                    <button mat-icon-button color="primary" (click)="approve(e, 'Approved')" matTooltip="Approve"><mat-icon>check</mat-icon></button>
                    <button mat-icon-button color="warn" (click)="approve(e, 'Rejected')" matTooltip="Reject"><mat-icon>close</mat-icon></button>
                  }
                }
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
  styles: [`.page{max-width:1400px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.filter-card{margin-bottom:16px;padding:16px!important}.filters{display:flex;gap:16px;flex-wrap:wrap}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class ExpenseListComponent implements OnInit {
  store = inject(AuthStore);
  router = inject(Router);
  private svc = inject(ExpenseService);
  private notify = inject(NotificationService);

  expenses = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  filters: any = { month_year: '', category_id: '', approval_status: '' };
  cols = ['date', 'category', 'title', 'amount', 'vendor', 'status', 'actions'];

  ngOnInit(): void {
    this.svc.getCategories().subscribe(r => this.categories.set(r.data));
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.svc.getAll({ ...this.filters, page: this.page(), limit: 20 }).subscribe({
      next: r => { this.expenses.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  approve(e: any, status: string): void {
    this.svc.approve(e.id, status).subscribe({ next: () => { this.notify.success(`${status}`); this.loadData(); }, error: err => this.notify.error(err.error?.message) });
  }
}
