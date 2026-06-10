import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AmenityService {
  private api = inject(ApiService);
  getAll = (p?: any) => this.api.get<any[]>('/amenities', p);
  getById = (id: number) => this.api.get<any>(`/amenities/${id}`);
  create = (d: any) => this.api.post<any>('/amenities', d);
  update = (id: number, d: any) => this.api.put<any>(`/amenities/${id}`, d);
  delete = (id: number) => this.api.delete<null>(`/amenities/${id}`);
  updateStatus = (id: number, status: string) => this.api.patch<any>(`/amenities/${id}/status`, { status });
}
