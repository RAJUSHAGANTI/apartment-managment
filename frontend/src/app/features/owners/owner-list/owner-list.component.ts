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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OwnerService } from '../services/owner.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-owner-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Owners</h2>
        <button mat-raised-button color="primary" (click)="router.navigate(['/owners/new'])"><mat-icon>add</mat-icon> Add Owner</button>
      </div>
      <mat-card class="filter-card">
        <mat-form-field appearance="outline">
          <mat-label>Search</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [(ngModel)]="search" (ngModelChange)="loadData()" placeholder="Name, email, phone...">
        </mat-form-field>
      </mat-card>
      <mat-card>
        @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
        @else {
          <table mat-table [dataSource]="owners()">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let o"><strong>{{ o.first_name }} {{ o.last_name }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let o">{{ o.email }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let o">{{ o.phone }}</td>
            </ng-container>
            <ng-container matColumnDef="apartments">
              <th mat-header-cell *matHeaderCellDef>Apts</th>
              <td mat-cell *matCellDef="let o">{{ o.apartment_count }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let o">
                <button mat-icon-button color="primary" [routerLink]="['/owners', o.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="delete(o)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
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
  styles: [`.page{max-width:1200px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.filter-card{margin-bottom:16px;padding:16px!important}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class OwnerListComponent implements OnInit {
  router = inject(Router);
  private svc = inject(OwnerService);
  private notify = inject(NotificationService);

  owners = signal<any[]>([]);
  loading = signal(true);
  total = signal(0);
  page = signal(1);
  search = '';
  cols = ['name', 'email', 'phone', 'apartments', 'actions'];

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getAll({ search: this.search, page: this.page(), limit: 20 }).subscribe({
      next: r => { this.owners.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  delete(o: any): void {
    if (!confirm(`Delete owner ${o.first_name} ${o.last_name}?`)) return;
    this.svc.delete(o.id).subscribe({ next: () => { this.notify.success('Deleted'); this.loadData(); }, error: e => this.notify.error(e.error?.message) });
  }
}
