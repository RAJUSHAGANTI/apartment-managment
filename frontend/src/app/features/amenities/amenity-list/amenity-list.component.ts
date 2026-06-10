import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { AmenityService } from '../services/amenity.service';
import { AuthStore } from '../../../core/auth/auth.store';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-amenity-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatGridListModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Amenities</h2>
        @if (store.isAdmin()) {
          <button mat-raised-button color="primary" (click)="router.navigate(['/amenities/new'])"><mat-icon>add</mat-icon> Add Amenity</button>
        }
      </div>
      @if (loading()) { <div class="center"><mat-spinner></mat-spinner></div> }
      @else {
        <div class="amenity-grid">
          @for (a of amenities(); track a.id) {
            <mat-card class="amenity-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>{{ categoryIcon(a.category) }}</mat-icon>
                <mat-card-title>{{ a.name }}</mat-card-title>
                <mat-card-subtitle>{{ a.category }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                @if (a.description) { <p>{{ a.description }}</p> }
                <div class="amenity-details">
                  @if (a.capacity) { <span><mat-icon inline>people</mat-icon> {{ a.capacity }}</span> }
                  <span><mat-icon inline>payments</mat-icon> ₹{{ a.monthly_cost }}/mo</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <mat-chip [color]="a.status === 'Active' ? 'primary' : 'warn'" highlighted>{{ a.status }}</mat-chip>
                @if (store.isAdmin()) {
                  <button mat-icon-button [routerLink]="['/amenities', a.id, 'edit']" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button color="warn" (click)="delete(a)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
                }
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1400px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 24px; font-weight: 500; margin: 0; }
    .center { display: flex; justify-content: center; padding: 48px; }
    .amenity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .amenity-card { height: 100%; }
    .amenity-details { display: flex; gap: 16px; font-size: 14px; color: #666; margin-top: 8px; }
    .amenity-details span { display: flex; align-items: center; gap: 4px; }
  `],
})
export class AmenityListComponent implements OnInit {
  store = inject(AuthStore);
  router = inject(Router);
  private svc = inject(AmenityService);
  private notify = inject(NotificationService);
  amenities = signal<any[]>([]);
  loading = signal(true);

  categoryIcon(cat: string): string {
    const map: any = { Recreation: 'pool', Health: 'fitness_center', Utility: 'electrical_services', Security: 'security', Transport: 'local_parking', Other: 'star' };
    return map[cat] || 'star';
  }

  ngOnInit(): void {
    this.svc.getAll({ limit: 50 }).subscribe({ next: r => { this.amenities.set(r.data); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  delete(a: any): void {
    if (!confirm(`Delete ${a.name}?`)) return;
    this.svc.delete(a.id).subscribe({ next: () => { this.notify.success('Deleted'); this.ngOnInit(); }, error: e => this.notify.error(e.error?.message) });
  }
}
