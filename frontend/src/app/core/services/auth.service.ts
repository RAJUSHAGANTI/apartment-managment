import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../auth/auth.store';
import { TokenStorageService } from '../auth/token-storage.service';
import { AuthResponse, LoginRequest, User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(AuthStore);
  private tokenStorage = inject(TokenStorageService);
  private router = inject(Router);
  private base = environment.apiUrl;

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/auth/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken, credentials.rememberMe);
          this.store.setUser(res.data.user);
        }
      })
    );
  }

  logout(): void {
    const token = this.tokenStorage.getAccessToken();
    if (token) {
      this.http.post(`${this.base}/auth/logout`, {}).subscribe();
    }
    this.tokenStorage.clear();
    this.store.clear();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(`${this.base}/auth/refresh`, { refreshToken })
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            const remember = localStorage.getItem('ams_remember_me') === 'true';
            this.tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken, remember);
          }
        })
      );
  }

  loadCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.base}/auth/me`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.store.setUser(res.data);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.base}/auth/reset-password`, { token, password });
  }
}
