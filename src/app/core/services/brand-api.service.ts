import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { Brand, BrandCreateRequest, BrandUpdateRequest } from '../models/catalog.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class BrandApiService {
  private readonly baseApi = inject(BaseApiService);

  list(): Observable<Brand[]> {
    return this.baseApi.get<Brand[] | ApiEnvelope<Brand[]>>(API_ENDPOINTS.brand.list).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: BrandCreateRequest): Observable<Brand> {
    return this.baseApi.post<Brand>(API_ENDPOINTS.brand.create, request);
  }

  update(id: number, request: BrandUpdateRequest): Observable<Brand> {
    return this.baseApi.patch<Brand>(API_ENDPOINTS.brand.update(id), request);
  }

  delete(id: number): Observable<void> {
    return this.baseApi.delete<void>(API_ENDPOINTS.brand.delete(id));
  }
}
