import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const dashboardRoutes: Routes = [
  { path: 'admin', canActivate: [roleGuard(['Admin'])], loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'owner', canActivate: [roleGuard(['Owner'])], loadComponent: () => import('./owner-dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent) },
  { path: 'tenant', canActivate: [roleGuard(['Tenant'])], loadComponent: () => import('./tenant-dashboard/tenant-dashboard.component').then(m => m.TenantDashboardComponent) },
  {
    path: '',
    loadComponent: () => import('./dashboard-redirect.component').then(m => m.DashboardRedirectComponent),
  },
];
