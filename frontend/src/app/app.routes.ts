import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes) },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes) },
      { path: 'apartments', loadChildren: () => import('./features/apartments/apartments.routes').then(m => m.apartmentRoutes) },
      { path: 'owners', canActivate: [roleGuard(['Admin'])], loadChildren: () => import('./features/owners/owners.routes').then(m => m.ownerRoutes) },
      { path: 'tenants', canActivate: [roleGuard(['Admin'])], loadChildren: () => import('./features/tenants/tenants.routes').then(m => m.tenantRoutes) },
      { path: 'amenities', loadChildren: () => import('./features/amenities/amenities.routes').then(m => m.amenityRoutes) },
      { path: 'maintenance', loadChildren: () => import('./features/maintenance/maintenance.routes').then(m => m.maintenanceRoutes) },
      { path: 'expenses', canActivate: [roleGuard(['Admin', 'Owner'])], loadChildren: () => import('./features/expenses/expenses.routes').then(m => m.expenseRoutes) },
      { path: 'reports', canActivate: [roleGuard(['Admin', 'Owner'])], loadChildren: () => import('./features/reports/reports.routes').then(m => m.reportRoutes) },
      { path: 'community', loadChildren: () => import('./features/community/community.routes').then(m => m.communityRoutes) },
      { path: 'profile', loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
