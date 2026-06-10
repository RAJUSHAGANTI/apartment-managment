import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const role = store.role();
  if (role && roles.includes(role)) return true;
  router.navigate(['/dashboard']);
  return false;
};
