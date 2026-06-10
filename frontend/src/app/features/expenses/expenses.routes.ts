import { Routes } from '@angular/router';

export const expenseRoutes: Routes = [
  { path: '', loadComponent: () => import('./expense-list/expense-list.component').then(m => m.ExpenseListComponent) },
  { path: 'new', loadComponent: () => import('./expense-form/expense-form.component').then(m => m.ExpenseFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./expense-form/expense-form.component').then(m => m.ExpenseFormComponent) },
];
