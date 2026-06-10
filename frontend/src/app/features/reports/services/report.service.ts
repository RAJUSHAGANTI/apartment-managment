import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getMaintenance = (p?: any) => this.api.get<any>('/reports/maintenance', p);
  getExpenses = (p?: any) => this.api.get<any>('/reports/expenses', p);
  getOccupancy = (p?: any) => this.api.get<any>('/reports/occupancy', p);
  getDefaulters = (p?: any) => this.api.get<any>('/reports/defaulters', p);

  exportPDF(type: string, params: any = {}) {
    const qs = new URLSearchParams({ ...params, type }).toString();
    return this.http.get(`${this.base}/reports/export/pdf?${qs}`, { responseType: 'blob' });
  }

  exportExcel(type: string, params: any = {}) {
    const qs = new URLSearchParams({ ...params, type }).toString();
    return this.http.get(`${this.base}/reports/export/excel?${qs}`, { responseType: 'blob' });
  }
}
