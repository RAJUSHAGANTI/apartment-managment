import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private api = inject(ApiService);
  getBills = (p?: any) => this.api.get<any[]>('/maintenance/bills', p);
  getBill = (id: number) => this.api.get<any>(`/maintenance/bills/${id}`);
  generateBills = (d: any) => this.api.post<any>('/maintenance/bills/generate', d);
  updateBill = (id: number, d: any) => this.api.put<any>(`/maintenance/bills/${id}`, d);
  recordPayment = (id: number, d: any) => this.api.post<any>(`/maintenance/bills/${id}/payment`, d);
  getRequests = (p?: any) => this.api.get<any[]>('/maintenance/requests', p);
  createRequest = (d: any) => this.api.post<any>('/maintenance/requests', d);
  updateRequest = (id: number, d: any) => this.api.put<any>(`/maintenance/requests/${id}`, d);
  deleteRequest = (id: number) => this.api.delete<null>(`/maintenance/requests/${id}`);
}
