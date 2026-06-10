import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApartmentService } from '../services/apartment.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';
import { Apartment } from '../../../core/models/apartment.model';

@Component({
  selector: 'app-apartment-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatChipsModule,
    MatProgressSpinnerModule, MatPaginatorModule, MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Apartments</h2>
        @if (store.isAdmin()) {
          <button mat-raised-button color="primary" (click)="router.navigate(['/apartments/new'])">
            <mat-icon>add</mat-icon> Add Apartment
          </button>
        }
      </div>

      <!-- Filters -->
      <mat-card class="filter-card">
        <div class="filters">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [(ngModel)]="filters.search" (ngModelChange)="loadData()" placeholder="Flat number...">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filters.status" (ngModelChange)="loadData()">
              <mat-option value="">All</mat-option>
              <mat-option value="Occupied">Occupied</mat-option>
              <mat-option value="Vacant">Vacant</mat-option>
              <mat-option value="Under Maintenance">Under Maintenance</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="filters.flat_type" (ngModelChange)="loadData()">
              <mat-option value="">All</mat-option>
              @for (t of flatTypes; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card>

      <!-- Table -->
      <mat-card>
        @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
        @else {
          <table mat-table [dataSource]="apartments()">
            <ng-container matColumnDef="flat">
              <th mat-header-cell *matHeaderCellDef>Flat</th>
              <td mat-cell *matCellDef="let a"><strong>{{ a.block_name }}-{{ a.flat_number }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let a">{{ a.flat_type }} | {{ a.area_sqft }} sqft</td>
            </ng-container>
            <ng-container matColumnDef="floor">
              <th mat-header-cell *matHeaderCellDef>Floor</th>
              <td mat-cell *matCellDef="let a">{{ a.floor }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [color]="statusColor(a.status)" highlighted>{{ a.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="maintenance">
              <th mat-header-cell *matHeaderCellDef>Maintenance</th>
              <td mat-cell *matCellDef="let a">₹{{ a.monthly_maintenance | number }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                @if (store.isAdmin()) {
                  <button mat-icon-button color="primary" [routerLink]="['/apartments', a.id, 'edit']" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="delete(a)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
          <mat-paginator [length]="total()" [pageSize]="20" (page)="onPage($event)"></mat-paginator>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .page-header h2 { font-size: 24px; font-weight: 500; margin: 0; }
    .filter-card { margin-bottom: 16px; padding: 16px !important; }
    .filters { display: flex; gap: 16px; flex-wrap: wrap; }
    .filters mat-form-field { min-width: 180px; }
    .center { display: flex; justify-content: center; padding: 48px; }
    table { width: 100%; }
  `],
})
export class ApartmentListComponent implements OnInit {
  store = inject(AuthStore);
  router = inject(Router);
  private svc = inject(ApartmentService);
  private notify = inject(NotificationService);

  apartments = signal<Apartment[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  filters: any = { search: '', status: '', flat_type: '' };
  displayedColumns = ['flat', 'type', 'floor', 'status', 'maintenance', 'actions'];
  flatTypes = ['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Villa', 'Studio'];

  statusColor(s: string) {
    return s === 'Occupied' ? 'primary' : s === 'Vacant' ? 'accent' : 'warn';
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getAll({ ...this.filters, page: this.page(), limit: 20 }).subscribe({
      next: r => { this.apartments.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  delete(apt: Apartment): void {
    if (!confirm(`Delete flat ${apt.flat_number}?`)) return;
    this.svc.delete(apt.id).subscribe({
      next: () => { this.notify.success('Apartment deleted'); this.loadData(); },
      error: (e) => this.notify.error(e.error?.message || 'Delete failed'),
    });
  }
}
