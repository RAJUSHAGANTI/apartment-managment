import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExpenseService } from '../services/expense.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule],
  template: `
    <div class="form-page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEdit ? 'Edit' : 'Add' }} Expense</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
          @else {
            <form [formGroup]="form" (ngSubmit)="save()">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category_id" required>
                    @for (c of categories(); track c.id) { <mat-option [value]="c.id">{{ c.name }}</mat-option> }
                  </mat-select>
                  @if (form.get('category_id')?.hasError('required') && form.get('category_id')?.touched) { <mat-error>Category required</mat-error> }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Month/Year</mat-label>
                  <input matInput formControlName="month_year" type="month" required>
                  @if (form.get('month_year')?.hasError('required') && form.get('month_year')?.touched) { <mat-error>Month required</mat-error> }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Expense Date</mat-label>
                  <input matInput formControlName="expense_date" type="date" required>
                  @if (form.get('expense_date')?.hasError('required') && form.get('expense_date')?.touched) { <mat-error>Date required</mat-error> }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Amount (₹)</mat-label>
                  <input matInput formControlName="amount" type="number" min="0" required>
                  @if (form.get('amount')?.hasError('required') && form.get('amount')?.touched) { <mat-error>Amount required</mat-error> }
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" required>
                  @if (form.get('title')?.hasError('required') && form.get('title')?.touched) { <mat-error>Title required</mat-error> }
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="3"></textarea>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Vendor Name</mat-label>
                  <input matInput formControlName="vendor_name">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Invoice Number</mat-label>
                  <input matInput formControlName="invoice_number">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Payment Mode</mat-label>
                  <mat-select formControlName="payment_mode">
                    <mat-option value="Cash">Cash</mat-option>
                    <mat-option value="Cheque">Cheque</mat-option>
                    <mat-option value="Online">Online</mat-option>
                    <mat-option value="UPI">UPI</mat-option>
                    <mat-option value="NEFT">NEFT</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div class="form-actions">
                <button mat-button type="button" (click)="router.navigate(['/expenses'])">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
                  @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
                  @else { {{ isEdit ? 'Update' : 'Add' }} Expense }
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.form-page{max-width:800px;margin:0 auto}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-top:16px}.full-width{grid-column:1/-1}.form-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.center{display:flex;justify-content:center;padding:48px}`],
})
export class ExpenseFormComponent implements OnInit {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  private svc = inject(ExpenseService);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);

  categories = signal<any[]>([]);
  loading = signal(false);
  saving = signal(false);
  isEdit = false;
  editId: number | null = null;

  form = this.fb.group({
    category_id: ['', Validators.required],
    month_year: ['', Validators.required],
    expense_date: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]],
    title: ['', Validators.required],
    description: [''],
    vendor_name: [''],
    invoice_number: [''],
    payment_mode: ['Cash'],
  });

  ngOnInit(): void {
    this.svc.getCategories().subscribe(r => this.categories.set(r.data));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = +id;
      this.loading.set(true);
      this.svc.getById(this.editId).subscribe({
        next: r => { this.form.patchValue(r.data); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    }
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const obs = this.isEdit ? this.svc.update(this.editId!, this.form.value) : this.svc.create(this.form.value);
    obs.subscribe({
      next: () => { this.notify.success(`Expense ${this.isEdit ? 'updated' : 'added'}`); this.router.navigate(['/expenses']); },
      error: e => { this.notify.error(e.error?.message || 'Save failed'); this.saving.set(false); },
    });
  }
}
