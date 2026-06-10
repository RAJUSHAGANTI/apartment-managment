import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthStore } from '../../core/auth/auth.store';

@Directive({ selector: '[hasRole]', standalone: true })
export class HasRoleDirective implements OnInit {
  @Input('hasRole') roles: string | string[] = [];

  private store = inject(AuthStore);
  private tpl = inject(TemplateRef<any>);
  private vcr = inject(ViewContainerRef);

  ngOnInit(): void {
    const allowed = Array.isArray(this.roles) ? this.roles : [this.roles];
    const role = this.store.role();
    if (role && allowed.includes(role)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
