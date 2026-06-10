import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AmenityService } from '../services/amenity.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-amenity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatCheckboxModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button mat-icon-button (click)="router.navigate(['/amenities'])"><mat-icon>arrow_back</mat-icon></button>
        <h2>{{ isEdit() ? 'Edit Amenity' : 'Add Amenity' }}</h2>
      </div>
      <mat-card><mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name" required></mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category" required>
                @for (c of categories; track c) { <mat-option [value]="c">{{ c }}</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Capacity</mat-label><input matInput formControlName="capacity" type="number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Monthly Cost (₹)</mat-label><input matInput formControlName="monthly_cost" type="number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Location</mat-label><input matInput formControlName="location"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Operating Hours</mat-label><input matInput formControlName="operating_hours"></mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="Active">Active</mat-option>
                <mat-option value="Under Maintenance">Under Maintenance</mat-option>
                <mat-option value="Closed">Closed</mat-option>
              </mat-select>
            </mat-form-field>
            <div class="checkbox-field"><mat-checkbox formControlName="booking_required">Booking Required</mat-checkbox></div>
            <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="3"></textarea></mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button type="button" (click)="router.navigate(['/amenities'])">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">{{ saving() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}</button>
          </div>
        </form>
      </mat-card-content></mat-card>
    </div>
  `,
  styles: [`.page{max-width:800px}.page-header{display:flex;align-items:center;gap:8px;margin-bottom:16px}.page-header h2{margin:0;font-size:24px;font-weight:500}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.full-width{grid-column:1/-1}.checkbox-field{display:flex;align-items:center;padding-bottom:16px}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}`],
})
export class AmenityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(AmenityService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);
  categories = ['Recreation', 'Health', 'Utility', 'Security', 'Transport', 'Other'];

  form = this.fb.group({
    name: ['', Validators.required], category: ['Recreation', Validators.required],
    description: [''], capacity: [null], monthly_cost: [0],
    location: [''], operating_hours: [''], status: ['Active'], booking_required: [false],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) { this.isEdit.set(true); this.svc.getById(+id).subscribe(r => this.form.patchValue(r.data)); }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.route.snapshot.params['id'];
    const obs = id ? this.svc.update(+id, this.form.value) : this.svc.create(this.form.value);
    obs.subscribe({ next: () => { this.notify.success(id ? 'Updated' : 'Created'); this.router.navigate(['/amenities']); }, error: e => { this.notify.error(e.error?.message || 'Failed'); this.saving.set(false); } });
  }
}
