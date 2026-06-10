import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _user = signal<User | null>(null);
  private _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());
  readonly role = computed(() => this._user()?.role ?? null);
  readonly isAdmin = computed(() => this._user()?.role === 'Admin');
  readonly isOwner = computed(() => this._user()?.role === 'Owner');
  readonly isTenant = computed(() => this._user()?.role === 'Tenant');
  readonly fullName = computed(() => {
    const u = this._user();
    return u ? `${u.first_name} ${u.last_name}` : '';
  });

  setUser(user: User | null): void {
    this._user.set(user);
  }

  setLoading(val: boolean): void {
    this._loading.set(val);
  }

  clear(): void {
    this._user.set(null);
  }
}
