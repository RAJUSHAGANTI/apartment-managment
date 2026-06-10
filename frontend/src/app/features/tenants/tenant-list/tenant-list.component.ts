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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TenantService } from '../services/tenant.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatPaginatorModule, MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Tenants</h2>
        <button mat-raised-button color="primary" (click)="router.navigate(['/tenants/new'])"><mat-icon>add</mat-icon> Add Tenant</button>
      </div>
      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline"><mat-label>Search</mat-label><mat-icon matPrefix>search</mat-icon><input matInput [(ngModel)]="search" (ngModelChange)="loadData()"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Status</mat-label>
            <mat-select [(ngModel)]="isActive" (ngModelChange)="loadData()">
              <mat-option value="">All</mat-option>
              <mat-option value="1">Active</mat-option>
              <mat-option value="0">Moved Out</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>
      <mat-card>
        @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
        @else {
          <table mat-table [dataSource]="tenants()">
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Name</th><td mat-cell *matCellDef="let t"><strong>{{ t.first_name }} {{ t.last_name }}</strong></td></ng-container>
            <ng-container matColumnDef="flat"><th mat-header-cell *matHeaderCellDef>Flat</th><td mat-cell *matCellDef="let t">{{ t.block_name }}-{{ t.flat_number }}</td></ng-container>
            <ng-container matColumnDef="phone"><th mat-header-cell *matHeaderCellDef>Phone</th><td mat-cell *matCellDef="let t">{{ t.phone }}</td></ng-container>
            <ng-container matColumnDef="move_in"><th mat-header-cell *matHeaderCellDef>Move In</th><td mat-cell *matCellDef="let t">{{ t.move_in_date }}</td></ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let t"><mat-chip [color]="t.is_active ? 'primary' : 'warn'" highlighted>{{ t.is_active ? 'Active' : 'Moved Out' }}</mat-chip></td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let t">
                <button mat-icon-button color="primary" [routerLink]="['/tenants', t.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                @if (t.is_active) {
                  <button mat-icon-button color="accent" (click)="moveOut(t)" matTooltip="Move Out"><mat-icon>exit_to_app</mat-icon></button>
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
  styles: [`.page{max-width:1200px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.filter-card{margin-bottom:16px;padding:16px!important}.filters{display:flex;gap:16px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class TenantListComponent implements OnInit {
  router = inject(Router);
  private svc = inject(TenantService);
  private notify = inject(NotificationService);
  tenants = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  search = '';
  isActive = '1';
  cols = ['name', 'flat', 'phone', 'move_in', 'status', 'actions'];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getAll({ search: this.search, is_active: this.isActive, page: this.page(), limit: 20 }).subscribe({
      next: r => { this.tenants.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  moveOut(t: any): void {
    const d = prompt('Enter move-out date (YYYY-MM-DD):');
    if (!d) return;
    this.svc.moveOut(t.id, d).subscribe({ next: () => { this.notify.success('Move-out recorded'); this.loadData(); }, error: e => this.notify.error(e.error?.message) });
  }
}
