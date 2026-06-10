import { Routes } from '@angular/router';

export const amenityRoutes: Routes = [
  { path: '', loadComponent: () => import('./amenity-list/amenity-list.component').then(m => m.AmenityListComponent) },
  { path: 'new', loadComponent: () => import('./amenity-form/amenity-form.component').then(m => m.AmenityFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./amenity-form/amenity-form.component').then(m => m.AmenityFormComponent) },
];
