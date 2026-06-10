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
  selector: 'app-events',
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
        <h2>Events</h2>
        @if (store.isAdmin()) {
          <button mat-raised-button color="primary" (click)="showForm.set(!showForm())"><mat-icon>add</mat-icon> New Event</button>
        }
      </div>

      @if (showForm()) {
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>{{ editing() ? 'Edit' : 'New' }} Event</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width"><mat-label>Title</mat-label><input matInput formControlName="title" required></mat-form-field>
                <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Event Date</mat-label><input matInput formControlName="event_date" type="date" required></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Start Time</mat-label><input matInput formControlName="start_time" type="time"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>End Time</mat-label><input matInput formControlName="end_time" type="time"></mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Event Type</mat-label>
                  <mat-select formControlName="event_type">
                    <mat-option value="Cultural">Cultural</mat-option>
                    <mat-option value="Sports">Sports</mat-option>
                    <mat-option value="Meeting">Meeting</mat-option>
                    <mat-option value="Festival">Festival</mat-option>
                    <mat-option value="Other">Other</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Venue</mat-label><input matInput formControlName="venue"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Max Attendees</mat-label><input matInput formControlName="max_attendees" type="number" min="1"></mat-form-field>
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
          <table mat-table [dataSource]="events()">
            <ng-container matColumnDef="title"><th mat-header-cell *matHeaderCellDef>Title</th><td mat-cell *matCellDef="let e"><strong>{{ e.title }}</strong></td></ng-container>
            <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let e"><mat-chip highlighted>{{ e.event_type }}</mat-chip></td></ng-container>
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let e">{{ e.event_date }}</td></ng-container>
            <ng-container matColumnDef="time"><th mat-header-cell *matHeaderCellDef>Time</th><td mat-cell *matCellDef="let e">{{ e.start_time }}{{ e.end_time ? ' - ' + e.end_time : '' }}</td></ng-container>
            <ng-container matColumnDef="venue"><th mat-header-cell *matHeaderCellDef>Venue</th><td mat-cell *matCellDef="let e">{{ e.venue }}</td></ng-container>
            <ng-container matColumnDef="capacity"><th mat-header-cell *matHeaderCellDef>Capacity</th><td mat-cell *matCellDef="let e">{{ e.max_attendees }}</td></ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let e">
                @if (store.isAdmin()) {
                  <button mat-icon-button color="primary" (click)="editEvent(e)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="deleteEvent(e)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
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
export class EventsComponent implements OnInit {
  store = inject(AuthStore);
  private svc = inject(CommunityService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  events = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  total = signal(0);
  page = signal(1);
  showForm = signal(false);
  editing = signal<any>(null);
  cols = ['title', 'type', 'date', 'time', 'venue', 'capacity', 'actions'];

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    event_date: ['', Validators.required],
    start_time: [''],
    end_time: [''],
    event_type: ['Meeting'],
    venue: [''],
    max_attendees: [null],
  });

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading.set(true);
    this.svc.getEvents({ page: this.page(), limit: 20 }).subscribe({
      next: r => { this.events.set(r.data); this.total.set(r.pagination?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onPage(e: PageEvent): void { this.page.set(e.pageIndex + 1); this.loadData(); }

  editEvent(e: any): void { this.editing.set(e); this.form.patchValue(e); this.showForm.set(true); }

  cancelForm(): void { this.showForm.set(false); this.editing.set(null); this.form.reset({ event_type: 'Meeting' }); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const e = this.editing();
    const obs = e ? this.svc.updateEvent(e.id, this.form.value) : this.svc.createEvent(this.form.value);
    obs.subscribe({
      next: () => { this.notify.success(e ? 'Event updated' : 'Event created'); this.cancelForm(); this.loadData(); },
      error: err => { this.notify.error(err.error?.message); this.saving.set(false); },
    });
  }

  deleteEvent(e: any): void {
    if (!confirm(`Delete "${e.title}"?`)) return;
    this.svc.deleteEvent(e.id).subscribe({ next: () => { this.notify.success('Deleted'); this.loadData(); }, error: err => this.notify.error(err.error?.message) });
  }
}
