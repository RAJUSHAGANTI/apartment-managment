import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MaintenanceService } from '../services/maintenance.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { ApartmentService } from '../../apartments/services/apartment.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-maintenance-requests',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatChipsModule, MatPaginatorModule,
    MatProgressSpinnerModule, MatTooltipModule, MatExpansionModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Maintenance Requests</h2>
        <div class="header-actions">
          <a mat-stroked-button routerLink="/maintenance/bills"><mat-icon>receipt_long</mat-icon> Bills</a>
          <button mat-raised-button color="primary" (click)="showForm.set(!showForm())"><mat-icon>add</mat-icon> New Request</button>
        </div>
      </div>

      @if (showForm()) {
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>Submit Request</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submitRequest()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Apartment</mat-label>
                  <mat-select formControlName="apartment_id" required>
                    @for (a of apartments(); track a.id) { <mat-option [value]="a.id">{{ a.block_name }}-{{ a.flat_number }}</mat-option> }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category" required>
                    @for (c of categories; track c) { <mat-option [value]="c">{{ c }}</mat-option> }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Priority</mat-label>
                  <mat-select formControlName="priority">
                    <mat-option value="Low">Low</mat-option>
                    <mat-option value="Medium">Medium</mat-option>
                    <mat-option value="High">High</mat-option>
                    <mat-option value="Emergency">Emergency</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Subject</mat-label><input matInput formControlName="subject" required></mat-form-field>
                <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3" required></textarea></mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="showForm.set(false)">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">Submit</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="filter-card">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="filterStatus" (ngModelChange)="loadData()">
            <mat-option value="">All</mat-option>
            <mat-option value="Open">Open</mat-option>
            <mat-option value="In Progress">In Progress</mat-option>
            <mat-option value="Resolved">Resolved</mat-option>
            <mat-option value="Closed">Closed</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-card>

      <mat-card>
        @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
        @else {
          <table mat-table [dataSource]="requests()">
            <ng-container matColumnDef="flat"><th mat-header-cell *matHeaderCellDef>Flat</th><td mat-cell *matCellDef="let r">{{ r.block_name }}-{{ r.flat_number }}</td></ng-container>
            <ng-container matColumnDef="subject"><th mat-header-cell *matHeaderCellDef>Subject</th><td mat-cell *matCellDef="let r">{{ r.subject }}</td></ng-container>
            <ng-container matColumnDef="category"><th mat-header-cell *matHeaderCellDef>Category</th><td mat-cell *matCellDef="let r">{{ r.category }}</td></ng-container>
            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef>Priority</th>
              <td mat-cell *matCellDef="let r"><mat-chip [color]="r.priority === 'Emergency' ? 'warn' : 'primary'" highlighted>{{ r.priority }}</mat-chip></td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r"><mat-chip>{{ r.status }}</mat-chip></td>
            </ng-container>
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let r">{{ r.created_at | date:'short' }}</td></ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r">
                @if (store.isAdmin()) {
                  <button mat-icon-button color="primary" (click)="updateStatus(r)" matTooltip="Update Status"><mat-icon>update</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="deleteRequest(r)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
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
  styles: [`.page{max-width:1400px}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.header-actions{display:flex;gap:8px}.form-card,.filter-card{margin-bottom:16px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.full-width{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;gap:8px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class MaintenanceRequestsComponent implements OnInit {
  store = inject(AuthStore);
  private svc = inject(MaintenanceService);
  private aptSvc = inject(ApartmentService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  requests = signal<any[]>([]);
  apartments = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  total = signal(0);
  page = signal(1);
  filterStatus = '';
  showForm = signal(false);
  cols = ['flat', 'subject', 'category', 'priority', 'status', 'date', 'actions'];
  categories = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Pest Control', 'Other'];

  form = this.fb.group({
    apartment_id: ['', Validators.required], category: ['Plumbing', Validators.required],
    subject: ['', Validators.required], description: ['', Validators.required], priority: ['Medium'],
  });

  ngOnInit(): void {
    this.loadData();
    this.aptSvc.getAll({ limit: 100 }).subscribe(r => this.apartments.set(r.data));
  }

  loadData(): void {
    this.loading.set(true);
    this.svc.getRequests({ status: this.filterStatus, page: this.page(), limit: 20 }).subscribe({
      next: r => { this.requests.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  submitRequest(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.svc.createRequest(this.form.value).subscribe({
      next: () => { this.notify.success('Request submitted'); this.showForm.set(false); this.form.reset(); this.loadData(); },
      error: e => { this.notify.error(e.error?.message); this.saving.set(false); },
      complete: () => this.saving.set(false),
    });
  }

  updateStatus(r: any): void {
    const status = prompt('New status (Open/In Progress/Resolved/Closed):');
    if (!status) return;
    this.svc.updateRequest(r.id, { status }).subscribe({ next: () => { this.notify.success('Updated'); this.loadData(); }, error: e => this.notify.error(e.error?.message) });
  }

  deleteRequest(r: any): void {
    if (!confirm('Delete request?')) return;
    this.svc.deleteRequest(r.id).subscribe({ next: () => { this.notify.success('Deleted'); this.loadData(); }, error: e => this.notify.error(e.error?.message) });
  }
}
