import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  private api = inject(ApiService);
  getAll = (p?: any) => this.api.get<any[]>('/owners', p);
  getById = (id: number) => this.api.get<any>(`/owners/${id}`);
  create = (d: any) => this.api.post<any>('/owners', d);
  update = (id: number, d: any) => this.api.put<any>(`/owners/${id}`, d);
  delete = (id: number) => this.api.delete<null>(`/owners/${id}`);
  getApartments = (id: number) => this.api.get<any[]>(`/owners/${id}/apartments`);
  assignApartment = (id: number, d: any) => this.api.post<any>(`/owners/${id}/apartments`, d);
}
