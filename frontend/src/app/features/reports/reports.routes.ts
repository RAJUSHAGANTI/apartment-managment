import { Routes } from '@angular/router';

export const reportRoutes: Routes = [
  { path: '', loadComponent: () => import('./reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent) },
  { path: 'maintenance', loadComponent: () => import('./maintenance-report/maintenance-report.component').then(m => m.MaintenanceReportComponent) },
  { path: 'expenses', loadComponent: () => import('./expense-report/expense-report.component').then(m => m.ExpenseReportComponent) },
  { path: 'occupancy', loadComponent: () => import('./occupancy-report/occupancy-report.component').then(m => m.OccupancyReportComponent) },
  { path: 'defaulters', loadComponent: () => import('./defaulters-report/defaulters-report.component').then(m => m.DefaultersReportComponent) },
];
