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
import { TenantService } from '../services/tenant.service';
import { ApartmentService } from '../../apartments/services/apartment.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-tenant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button mat-icon-button (click)="router.navigate(['/tenants'])"><mat-icon>arrow_back</mat-icon></button>
        <h2>{{ isEdit() ? 'Edit Tenant' : 'Add Tenant' }}</h2>
      </div>
      <mat-card><mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput formControlName="first_name" required></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput formControlName="last_name" required></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email" type="email" required></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone" required></mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Apartment</mat-label>
              <mat-select formControlName="apartment_id">
                @for (a of apartments(); track a.id) { <mat-option [value]="a.id">{{ a.block_name }}-{{ a.flat_number }} ({{ a.flat_type }})</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Move-in Date</mat-label><input matInput formControlName="move_in_date" type="date" required></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Rent (₹)</mat-label><input matInput formControlName="rent_amount" type="number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Deposit (₹)</mat-label><input matInput formControlName="deposit_amount" type="number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Aadhar Number</mat-label><input matInput formControlName="aadhar_number"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Emergency Contact</mat-label><input matInput formControlName="emergency_contact_name"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Emergency Phone</mat-label><input matInput formControlName="emergency_contact_phone"></mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-button type="button" (click)="router.navigate(['/tenants'])">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">{{ saving() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}</button>
          </div>
        </form>
      </mat-card-content></mat-card>
    </div>
  `,
  styles: [`.page{max-width:900px}.page-header{display:flex;align-items:center;gap:8px;margin-bottom:16px}.page-header h2{margin:0;font-size:24px;font-weight:500}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}`],
})
export class TenantFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(TenantService);
  private aptSvc = inject(ApartmentService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);
  apartments = signal<any[]>([]);

  form = this.fb.group({
    first_name: ['', Validators.required], last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]], phone: ['', Validators.required],
    apartment_id: [''], move_in_date: ['', Validators.required],
    rent_amount: [0], deposit_amount: [0], aadhar_number: [''],
    emergency_contact_name: [''], emergency_contact_phone: [''],
  });

  ngOnInit(): void {
    this.aptSvc.getAll({ limit: 100 }).subscribe(r => this.apartments.set(r.data));
    const id = this.route.snapshot.params['id'];
    if (id) { this.isEdit.set(true); this.svc.getById(+id).subscribe(r => this.form.patchValue(r.data)); }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const id = this.route.snapshot.params['id'];
    const obs = id ? this.svc.update(+id, this.form.value) : this.svc.create(this.form.value);
    obs.subscribe({ next: () => { this.notify.success(id ? 'Updated' : 'Created'); this.router.navigate(['/tenants']); }, error: e => { this.notify.error(e.error?.message || 'Failed'); this.saving.set(false); } });
  }
}
