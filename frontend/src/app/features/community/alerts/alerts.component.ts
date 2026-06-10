import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommunityService } from '../services/community.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="page">
      <div class="tab-nav">
        <a mat-button routerLink="/community/notices" routerLinkActive="active">Notices</a>
        <a mat-button routerLink="/community/events" routerLinkActive="active">Events</a>
        <a mat-button routerLink="/community/alerts" routerLinkActive="active">Alerts</a>
      </div>
      <div class="page-header">
        <h2>Alerts</h2>
        @if (store.isAdmin()) {
          <button mat-raised-button color="primary" (click)="showForm.set(!showForm())"><mat-icon>add</mat-icon> New Alert</button>
        }
      </div>

      @if (showForm()) {
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>{{ editing() ? 'Edit' : 'New' }} Alert</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width"><mat-label>Title</mat-label><input matInput formControlName="title" required></mat-form-field>
                <mat-form-field appearance="outline" class="full-width"><mat-label>Message</mat-label><textarea matInput formControlName="message" rows="3" required></textarea></mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Alert Type</mat-label>
                  <mat-select formControlName="alert_type">
                    <mat-option value="Water Shutdown">Water Shutdown</mat-option>
                    <mat-option value="Power Outage">Power Outage</mat-option>
                    <mat-option value="Lift Maintenance">Lift Maintenance</mat-option>
                    <mat-option value="Security">Security</mat-option>
                    <mat-option value="General">General</mat-option>
                    <mat-option value="Emergency">Emergency</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Severity</mat-label>
                  <mat-select formControlName="severity">
                    <mat-option value="Low">Low</mat-option>
                    <mat-option value="Medium">Medium</mat-option>
                    <mat-option value="High">High</mat-option>
                    <mat-option value="Critical">Critical</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Start Time</mat-label><input matInput formControlName="start_time" type="datetime-local"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>End Time</mat-label><input matInput formControlName="end_time" type="datetime-local"></mat-form-field>
                <mat-form-field appearance="outline" class="full-width"><mat-label>Affected Area</mat-label><input matInput formControlName="affected_area"></mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="cancelForm()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">Save</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      <mat-card>
        @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
        @else {
          <table mat-table [dataSource]="alerts()">
            <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Title</th><td mat-cell *matCellDef="let a"><strong>{{ a.title }}</strong></td></ng-container>
            <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let a">{{ a.alert_type }}</td></ng-container>
            <ng-container matColumnDef="severity">
              <th mat-header-cell *matHeaderCellDef>Severity</th>
              <td mat-cell *matCellDef="let a"><mat-chip [color]="severityColor(a.severity)" highlighted>{{ a.severity }}</mat-chip></td>
            </ng-container>
            <ng-container matColumnDef="start"><th mat-header-cell *matHeaderCellDef>Start</th><td mat-cell *matCellDef="let a">{{ a.start_time | date:'short' }}</td></ng-container>
            <ng-container matColumnDef="end"><th mat-header-cell *matHeaderCellDef>End</th><td mat-cell *matCellDef="let a">{{ a.end_time | date:'short' }}</td></ng-container>
            <ng-container matColumnDef="area"><th mat-header-cell *matHeaderCellDef>Affected Area</th><td mat-cell *matCellDef="let a">{{ a.affected_area }}</td></ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a">
                @if (store.isAdmin()) {
                  <button mat-icon-button color="primary" (click)="editAlert(a)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="deleteAlert(a)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
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
  styles: [`.page{max-width:1200px}.tab-nav{margin-bottom:8px}.tab-nav .active{background:rgba(63,81,181,.1);font-weight:600}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.form-card{margin-bottom:16px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-top:16px}.full-width{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}`],
})
export class AlertsComponent implements OnInit {
  store = inject(AuthStore);
  private svc = inject(CommunityService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  alerts = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  total = signal(0);
  page = signal(1);
  showForm = signal(false);
  editing = signal<any>(null);
  cols = ['title', 'type', 'severity', 'start', 'end', 'area', 'actions'];

  form = this.fb.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    alert_type: ['General'],
    severity: ['Medium'],
    start_time: [''],
    end_time: [''],
    affected_area: [''],
  });

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getAlerts({ page: this.page(), limit: 20 }).subscribe({
      next: r => { this.alerts.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }
  severityColor(s: string): string { return s === 'Critical' ? 'warn' : s === 'High' ? 'warn' : 'accent'; }
  editAlert(a: any): void { this.editing.set(a); this.form.patchValue(a); this.showForm.set(true); }
  cancelForm(): void { this.showForm.set(false); this.editing.set(null); this.form.reset({ alert_type: 'General', severity: 'Medium' }); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const a = this.editing();
    const obs = a ? this.svc.updateAlert(a.id, this.form.value) : this.svc.createAlert(this.form.value);
    obs.subscribe({
      next: () => { this.notify.success(a ? 'Alert updated' : 'Alert created'); this.cancelForm(); this.loadData(); },
      error: err => { this.notify.error(err.error?.message); this.saving.set(false); },
    });
  }

  deleteAlert(a: any): void {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.svc.deleteAlert(a.id).subscribe({ next: () => { this.notify.success('Deleted'); this.loadData(); }, error: err => this.notify.error(err.error?.message) });
  }
}
