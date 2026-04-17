import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { Category, CategoryMutationRequest } from '../models/catalog.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly baseApi = inject(BaseApiService);

  list(): Observable<Category[]> {
    return this.baseApi.get<Category[] | ApiEnvelope<Category[]>>(API_ENDPOINTS.category.list).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: CategoryMutationRequest): Observable<Category> {
    return this.baseApi.post<Category>(API_ENDPOINTS.category.create, request);
  }

  update(id: number, request: CategoryMutationRequest): Observable<Category> {
    return this.baseApi.patch<Category>(API_ENDPOINTS.category.update(id), request);
  }

  delete(id: number): Observable<void> {
    return this.baseApi.delete<void>(API_ENDPOINTS.category.delete(id));
  }
}
