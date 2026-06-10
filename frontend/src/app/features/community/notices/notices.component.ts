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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommunityService } from '../services/community.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatTooltipModule, MatCheckboxModule],
  template: `
    <div class="page">
      <div class="tab-nav">
        <a mat-button routerLink="/community/notices" routerLinkActive="active">Notices</a>
        <a mat-button routerLink="/community/events" routerLinkActive="active">Events</a>
        <a mat-button routerLink="/community/alerts" routerLinkActive="active">Alerts</a>
      </div>
      <div class="page-header">
        <h2>Notices</h2>
        @if (store.isAdmin()) {
          <button mat-raised-button color="primary" (click)="showForm.set(!showForm())"><mat-icon>add</mat-icon> New Notice</button>
        }
      </div>

      @if (showForm()) {
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>{{ editing() ? 'Edit' : 'New' }} Notice</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width"><mat-label>Title</mat-label><input matInput formControlName="title" required></mat-form-field>
                <mat-form-field appearance="outline" class="full-width"><mat-label>Content</mat-label><textarea matInput formControlName="content" rows="4" required></textarea></mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Notice Type</mat-label>
                  <mat-select formControlName="notice_type">
                    <mat-option value="General">General</mat-option>
                    <mat-option value="Maintenance">Maintenance</mat-option>
                    <mat-option value="Emergency">Emergency</mat-option>
                    <mat-option value="Financial">Financial</mat-option>
                    <mat-option value="Event">Event</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Target Role</mat-label>
                  <mat-select formControlName="target_role">
                    <mat-option value="All">All</mat-option>
                    <mat-option value="Owner">Owners</mat-option>
                    <mat-option value="Tenant">Tenants</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Publish Date</mat-label><input matInput formControlName="publish_date" type="date"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Expiry Date</mat-label><input matInput formControlName="expiry_date" type="date"></mat-form-field>
                <div><mat-checkbox formControlName="is_pinned">Pin this notice</mat-checkbox></div>
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
          <table mat-table [dataSource]="notices()">
            <ng-container matColumnDef="pinned"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let n">@if(n.is_pinned){<mat-icon color="warn">push_pin</mat-icon>}</td></ng-container>
            <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Title</th><td mat-cell *matCellDef="let n"><strong>{{ n.title }}</strong></td></ng-container>
            <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let n"><mat-chip highlighted>{{ n.notice_type }}</mat-chip></td></ng-container>
            <ng-container matColumnDef="target"><th mat-header-cell *matHeaderCellDef>For</th><td mat-cell *matCellDef="let n">{{ n.target_role }}</td></ng-container>
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Published</th><td mat-cell *matCellDef="let n">{{ n.publish_date }}</td></ng-container>
            <ng-container matColumnDef="expiry"><th mat-header-cell *matHeaderCellDef>Expires</th><td mat-cell *matCellDef="let n">{{ n.expiry_date }}</td></ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let n">
                @if (store.isAdmin()) {
                  <button mat-icon-button color="primary" (click)="editNotice(n)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="deleteNotice(n)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols" class="clickable" (click)="viewContent(r)"></tr>
          </table>
          <mat-paginator [length]="total()" [pageSize]="20" (page)="onPage($event)"></mat-paginator>
        }
      </mat-card>
    </div>
  `,
  styles: [`.page{max-width:1200px}.tab-nav{margin-bottom:8px}.tab-nav .active{background:rgba(63,81,181,.1);font-weight:600}.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.page-header h2{font-size:24px;font-weight:500;margin:0}.form-card{margin-bottom:16px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-top:16px}.full-width{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.center{display:flex;justify-content:center;padding:48px}table{width:100%}.clickable{cursor:pointer}`],
})
export class NoticesComponent implements OnInit {
  store = inject(AuthStore);
  private svc = inject(CommunityService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  notices = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  total = signal(0);
  page = signal(1);
  showForm = signal(false);
  editing = signal<any>(null);
  cols = ['pinned', 'title', 'type', 'target', 'date', 'expiry', 'actions'];

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    notice_type: ['General'],
    target_role: ['All'],
    publish_date: [''],
    expiry_date: [''],
    is_pinned: [false],
  });

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getNotices({ page: this.page(), limit: 20 }).subscribe({
      next: r => { this.notices.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  editNotice(n: any): void {
    this.editing.set(n);
    this.form.patchValue(n);
    this.showForm.set(true);
  }

  cancelForm(): void { this.showForm.set(false); this.editing.set(null); this.form.reset({ notice_type: 'General', target_role: 'All', is_pinned: false }); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const n = this.editing();
    const obs = n ? this.svc.updateNotice(n.id, this.form.value) : this.svc.createNotice(this.form.value);
    obs.subscribe({
      next: () => { this.notify.success(n ? 'Notice updated' : 'Notice created'); this.cancelForm(); this.loadData(); },
      error: e => { this.notify.error(e.error?.message); this.saving.set(false); },
    });
  }

  deleteNotice(n: any): void {
    if (!confirm(`Delete "${n.title}"?`)) return;
    this.svc.deleteNotice(n.id).subscribe({ next: () => { this.notify.success('Deleted'); this.loadData(); }, error: e => this.notify.error(e.error?.message) });
  }

  viewContent(n: any): void { alert(`${n.title}\n\n${n.content}`); }
}
