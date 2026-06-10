import { Routes } from '@angular/router';

export const maintenanceRoutes: Routes = [
  { path: '', redirectTo: 'bills', pathMatch: 'full' },
  { path: 'bills', loadComponent: () => import('./bills/maintenance-bills.component').then(m => m.MaintenanceBillsComponent) },
  { path: 'requests', loadComponent: () => import('./requests/maintenance-requests.component').then(m => m.MaintenanceRequestsComponent) },
];
