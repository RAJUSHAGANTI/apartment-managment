import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private api = inject(ApiService);

  // Notices
  getNotices = (p?: any) => this.api.get<any[]>('/community/notices', p);
  getNoticeById = (id: number) => this.api.get<any>(`/community/notices/${id}`);
  createNotice = (d: any) => this.api.post<any>('/community/notices', d);
  updateNotice = (id: number, d: any) => this.api.put<any>(`/community/notices/${id}`, d);
  deleteNotice = (id: number) => this.api.delete<null>(`/community/notices/${id}`);

  // Events
  getEvents = (p?: any) => this.api.get<any[]>('/community/events', p);
  getEventById = (id: number) => this.api.get<any>(`/community/events/${id}`);
  createEvent = (d: any) => this.api.post<any>('/community/events', d);
  updateEvent = (id: number, d: any) => this.api.put<any>(`/community/events/${id}`, d);
  deleteEvent = (id: number) => this.api.delete<null>(`/community/events/${id}`);

  // Alerts
  getAlerts = (p?: any) => this.api.get<any[]>('/community/alerts', p);
  getAlertById = (id: number) => this.api.get<any>(`/community/alerts/${id}`);
  createAlert = (d: any) => this.api.post<any>('/community/alerts', d);
  updateAlert = (id: number, d: any) => this.api.put<any>(`/community/alerts/${id}`, d);
  deleteAlert = (id: number) => this.api.delete<null>(`/community/alerts/${id}`);
}
