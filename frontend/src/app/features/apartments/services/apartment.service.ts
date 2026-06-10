import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { Apartment, Block } from '../../../core/models/apartment.model';

@Injectable({ providedIn: 'root' })
export class ApartmentService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<ApiResponse<Apartment[]>> {
    return this.api.get<Apartment[]>('/apartments', params);
  }

  getById(id: number): Observable<ApiResponse<Apartment>> {
    return this.api.get<Apartment>(`/apartments/${id}`);
  }

  create(data: Partial<Apartment>): Observable<ApiResponse<Apartment>> {
    return this.api.post<Apartment>('/apartments', data);
  }

  update(id: number, data: Partial<Apartment>): Observable<ApiResponse<Apartment>> {
    return this.api.put<Apartment>(`/apartments/${id}`, data);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`/apartments/${id}`);
  }

  getBlocks(): Observable<ApiResponse<Block[]>> {
    return this.api.get<Block[]>('/apartments/blocks');
  }

  createBlock(data: Partial<Block>): Observable<ApiResponse<Block>> {
    return this.api.post<Block>('/apartments/blocks', data);
  }
}
