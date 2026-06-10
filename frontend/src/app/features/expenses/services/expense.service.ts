import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private api = inject(ApiService);
  getAll = (p?: any) => this.api.get<any[]>('/expenses', p);
  getById = (id: number) => this.api.get<any>(`/expenses/${id}`);
  create = (d: any) => this.api.post<any>('/expenses', d);
  update = (id: number, d: any) => this.api.put<any>(`/expenses/${id}`, d);
  delete = (id: number) => this.api.delete<null>(`/expenses/${id}`);
  approve = (id: number, status: string) => this.api.patch<any>(`/expenses/${id}/approve`, { status });
  getCategories = () => this.api.get<any[]>('/expenses/categories');
  getSummary = (p?: any) => this.api.get<any>('/expenses/summary', p);
}
