import { ApplicationConfig, APP_INITIALIZER, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { AuthService } from './core/services/auth.service';
import { TokenStorageService } from './core/auth/token-storage.service';
import { AuthStore } from './core/auth/auth.store';

function initAuth() {
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const store = inject(AuthStore);
  return () => {
    const token = tokenStorage.getAccessToken();
    if (!token) return Promise.resolve();
    return new Promise<void>(resolve => {
      authService.loadCurrentUser().subscribe({
        next: () => resolve(),
        error: () => { store.clear(); tokenStorage.clear(); resolve(); },
      });
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loadingInterceptor, jwtInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    { provide: APP_INITIALIZER, useFactory: initAuth, multi: true },
  ],
};
