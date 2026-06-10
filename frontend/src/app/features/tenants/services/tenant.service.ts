import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private api = inject(ApiService);
  getAll = (p?: any) => this.api.get<any[]>('/tenants', p);
  getById = (id: number) => this.api.get<any>(`/tenants/${id}`);
  create = (d: any) => this.api.post<any>('/tenants', d);
  update = (id: number, d: any) => this.api.put<any>(`/tenants/${id}`, d);
  delete = (id: number) => this.api.delete<null>(`/tenants/${id}`);
  moveOut = (id: number, date: string) => this.api.patch<any>(`/tenants/${id}/move-out`, { move_out_date: date });
}
