import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/services/auth.service';
import { LoadingBarComponent } from '../../shared/loading-bar/loading-bar.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['Admin', 'Owner', 'Tenant'] },
  { label: 'Apartments', icon: 'apartment', route: '/apartments', roles: ['Admin', 'Owner'] },
  { label: 'Owners', icon: 'people', route: '/owners', roles: ['Admin'] },
  { label: 'Tenants', icon: 'person', route: '/tenants', roles: ['Admin'] },
  { label: 'Amenities', icon: 'pool', route: '/amenities', roles: ['Admin', 'Owner', 'Tenant'] },
  { label: 'Maintenance', icon: 'build', route: '/maintenance', roles: ['Admin', 'Owner', 'Tenant'] },
  { label: 'Expenses', icon: 'receipt_long', route: '/expenses', roles: ['Admin', 'Owner'] },
  { label: 'Reports', icon: 'bar_chart', route: '/reports', roles: ['Admin', 'Owner'] },
  { label: 'Community', icon: 'campaign', route: '/community', roles: ['Admin', 'Owner', 'Tenant'] },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LoadingBarComponent,
    MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatDividerModule, MatTooltipModule,
  ],
  template: `
    <app-loading-bar></app-loading-bar>
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" class="app-sidenav">
        <div class="sidenav-header">
          <mat-icon class="app-icon">domain</mat-icon>
          <span class="app-title">ApartmentMS</span>
        </div>
        <mat-divider></mat-divider>
        <mat-nav-list>
          @for (item of visibleNavItems(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-nav">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <div class="sidenav-footer">
          <mat-divider></mat-divider>
          <a mat-list-item routerLink="/profile">
            <mat-icon matListItemIcon>manage_accounts</mat-icon>
            <span matListItemTitle>Profile</span>
          </a>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="app-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-spacer"></span>
          <span class="user-name">{{ store.fullName() }}</span>
          <span class="role-badge">{{ store.role() }}</span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu>
            <button mat-menu-item routerLink="/profile"><mat-icon>person</mat-icon> Profile</button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon> Logout</button>
          </mat-menu>
        </mat-toolbar>

        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .app-sidenav { width: 240px; }
    .sidenav-header { display: flex; align-items: center; padding: 16px; gap: 12px; background: #1976d2; color: white; }
    .app-icon { font-size: 28px; width: 28px; height: 28px; }
    .app-title { font-size: 18px; font-weight: 600; }
    .sidenav-footer { position: absolute; bottom: 0; width: 100%; }
    .app-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-spacer { flex: 1; }
    .main-content { padding: 24px; }
    .user-name { font-size: 14px; margin-right: 8px; }
    .role-badge { background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 8px; }
    .active-nav { background: rgba(25, 118, 210, 0.1); color: #1976d2; }
    .active-nav mat-icon { color: #1976d2; }
  `],
})
export class ShellComponent {
  store = inject(AuthStore);
  private authService = inject(AuthService);

  isMobile = signal(window.innerWidth < 768);

  visibleNavItems() {
    const role = this.store.role();
    return NAV_ITEMS.filter(item => role && item.roles.includes(role));
  }

  logout(): void {
    this.authService.logout();
  }
}
