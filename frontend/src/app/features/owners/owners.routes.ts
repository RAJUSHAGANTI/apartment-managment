import { Routes } from '@angular/router';

export const ownerRoutes: Routes = [
  { path: '', loadComponent: () => import('./owner-list/owner-list.component').then(m => m.OwnerListComponent) },
  { path: 'new', loadComponent: () => import('./owner-form/owner-form.component').then(m => m.OwnerFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./owner-form/owner-form.component').then(m => m.OwnerFormComponent) },
];
