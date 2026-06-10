import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { TokenStorageService } from './token-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  const tokenStorage = inject(TokenStorageService);

  if (store.isAuthenticated() || tokenStorage.getAccessToken()) {
    return true;
  }
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
