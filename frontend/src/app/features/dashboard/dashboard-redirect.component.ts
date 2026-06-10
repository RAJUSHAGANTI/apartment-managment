import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  standalone: true,
  template: `<div></div>`,
})
export class DashboardRedirectComponent implements OnInit {
  private store = inject(AuthStore);
  private router = inject(Router);

  ngOnInit(): void {
    const role = this.store.role();
    if (role === 'Admin') this.router.navigate(['/dashboard/admin']);
    else if (role === 'Owner') this.router.navigate(['/dashboard/owner']);
    else this.router.navigate(['/dashboard/tenant']);
  }
}
