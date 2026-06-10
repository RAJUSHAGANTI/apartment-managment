import { Injectable } from '@angular/core';

const ACCESS_KEY = 'ams_access_token';
const REFRESH_KEY = 'ams_refresh_token';
const REMEMBER_KEY = 'ams_remember_me';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private get storage(): Storage {
    return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage;
  }

  setTokens(access: string, refresh: string, remember = false): void {
    localStorage.setItem(REMEMBER_KEY, String(remember));
    this.storage.setItem(ACCESS_KEY, access);
    this.storage.setItem(REFRESH_KEY, refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY) ?? sessionStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
  }

  clear(): void {
    [localStorage, sessionStorage].forEach(s => {
      s.removeItem(ACCESS_KEY);
      s.removeItem(REFRESH_KEY);
    });
    localStorage.removeItem(REMEMBER_KEY);
  }
}
