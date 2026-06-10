import { Routes } from '@angular/router';

export const apartmentRoutes: Routes = [
  { path: '', loadComponent: () => import('./apartment-list/apartment-list.component').then(m => m.ApartmentListComponent) },
  { path: 'new', loadComponent: () => import('./apartment-form/apartment-form.component').then(m => m.ApartmentFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./apartment-form/apartment-form.component').then(m => m.ApartmentFormComponent) },
];
