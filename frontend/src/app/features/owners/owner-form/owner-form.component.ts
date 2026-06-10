import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OwnerService } from '../services/owner.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-owner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button mat-icon-button (click)="router.navigate(['/owners'])"><mat-icon>arrow_back</mat-icon></button>
        <h2>{{ isEdit() ? 'Edit Owner' : 'Add Owner' }}</h2>
      </div>
      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-grid">
              <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput formControlName="first_name" required></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput formControlName="last_name" required></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email" type="email" required></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phone" required></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Alternate Phone</mat-label><input matInput formControlName="alternate_phone"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Aadhar Number</mat-label><input matInput formControlName="aadhar_number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>PAN Number</mat-label><input matInput formControlName="pan_number"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>City</mat-label><input matInput formControlName="city"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>State</mat-label><input matInput formControlName="state"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Pincode</mat-label><input matInput formControlName="pincode"></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>Address</mat-label><textarea matInput formControlName="address" rows="2"></textarea></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Bank Account</mat-label><input matInput formControlName="bank_account"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Bank IFSC</mat-label><input matInput formControlName="bank_ifsc"></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Bank Name</mat-label><input matInput formControlName="bank_name"></mat-form-field>
            </div>
            <div class="form-actions">
              <button mat-button type="button" (click)="router.navigate(['/owners'])">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">{{ saving() ? 'Saving...' : (isEdit() ? 'Update' : 'Create') }}</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.page{max-width:900px}.page-header{display:flex;align-items:center;gap:8px;margin-bottom:16px}.page-header h2{margin:0;font-size:24px;font-weight:500}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.full-width{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}`],
})
export class OwnerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(OwnerService);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);
  router = inject(Router);
  isEdit = signal(false);
  saving = signal(false);

  form = this.fb.group({
    first_name: ['', Validators.required], last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]], phone: ['', Validators.required],
    alternate_phone: [''], aadhar_number: [''], pan_number: [''],
    address: [''], city: [''], state: [''], pincode: [''],
    bank_account: [''], bank_ifsc: [''], bank_name: [''],
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
    obs.subscribe({ next: () => { this.notify.success(id ? 'Updated' : 'Created'); this.router.navigate(['/owners']); }, error: e => { this.notify.error(e.error?.message || 'Failed'); this.saving.set(false); } });
  }
}
