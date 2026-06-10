import { Routes } from '@angular/router';

export const communityRoutes: Routes = [
  { path: '', redirectTo: 'notices', pathMatch: 'full' },
  { path: 'notices', loadComponent: () => import('./notices/notices.component').then(m => m.NoticesComponent) },
  { path: 'events', loadComponent: () => import('./events/events.component').then(m => m.EventsComponent) },
  { path: 'alerts', loadComponent: () => import('./alerts/alerts.component').then(m => m.AlertsComponent) },
];
