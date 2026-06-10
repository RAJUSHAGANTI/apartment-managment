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
import { ApartmentService } from '../services/apartment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Block } from '../../../core/models/apartment.model';

@Component({
  selector: 'app-apartment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button mat-icon-button (click)="router.navigate(['/apartments'])"><mat-icon>arrow_back</mat-icon></button>
        <h2>{{ isEdit() ? 'Edit Apartment' : 'Add Apartment' }}</h2>
      </div>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Block</mat-label>
                <mat-select formControlName="block_id" required>
                  @for (b of blocks(); track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Flat Number</mat-label>
                <input matInput formControlName="flat_number" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Floor</mat-label>
                <input matInput formControlName="floor" type="number" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select formControlName="flat_type" required>
                  @for (t of flatTypes; track t) { <mat-option [value]="t">{{ t }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Area (sqft)</mat-label>
                <input matInput formControlName="area_sqft" type="number" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Facing</mat-label>
                <mat-select formControlName="facing">
                  @for (f of facings; track f) { <mat-option [value]="f">{{ f }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status" required>
                  <mat-option value="Vacant">Vacant</mat-option>
                  <mat-option value="Occupied">Occupied</mat-option>
                  <mat-option value="Under Maintenance">Under Maintenance</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Monthly Maintenance (₹)</mat-label>
                <input matInput formControlName="monthly_maintenance" type="number" required>
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3"></textarea>
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="router.navigate(['/apartments'])">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                {{ saving() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .page-header h2 { margin: 0; font-size: 24px; font-weight: 500; }
    .form-card { padding: 16px !important; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .full-width { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `],
})
export class ApartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ApartmentService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  router = inject(Router);

  isEdit = signal(false);
  saving = signal(false);
  blocks = signal<Block[]>([]);
  flatTypes = ['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Villa', 'Studio'];
  facings = ['North', 'South', 'East', 'West', 'NE', 'NW', 'SE', 'SW'];

  form = this.fb.group({
    block_id: ['', Validators.required],
    flat_number: ['', Validators.required],
    floor: [1, Validators.required],
    flat_type: ['2BHK', Validators.required],
    area_sqft: [0, Validators.required],
    facing: [''],
    status: ['Vacant', Validators.required],
    monthly_maintenance: [0, Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.svc.getBlocks().subscribe(r => this.blocks.set(r.data));
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit.set(true);
      this.svc.getById(+id).subscribe(r => this.form.patchValue(r.data as any));
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.route.snapshot.params['id'];
    const obs = id
      ? this.svc.update(+id, this.form.value as any)
      : this.svc.create(this.form.value as any);

    obs.subscribe({
      next: () => { this.notify.success(id ? 'Updated' : 'Created'); this.router.navigate(['/apartments']); },
      error: (e) => { this.notify.error(e.error?.message || 'Failed'); this.saving.set(false); },
    });
  }
}
