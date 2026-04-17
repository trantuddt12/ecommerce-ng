import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { CategoryAttribute, CategoryAttributeRequest } from '../models/catalog.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class CategoryAttributeApiService {
  private readonly baseApi = inject(BaseApiService);

  list(categoryId: number): Observable<CategoryAttribute[]> {
    return this.baseApi.get<CategoryAttribute[] | ApiEnvelope<CategoryAttribute[]>>(API_ENDPOINTS.attribute.byCategory(categoryId)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(categoryId: number, request: CategoryAttributeRequest): Observable<CategoryAttribute> {
    return this.baseApi.post<CategoryAttribute>(API_ENDPOINTS.attribute.byCategory(categoryId), request);
  }

  update(categoryId: number, id: number, request: CategoryAttributeRequest): Observable<CategoryAttribute> {
    return this.baseApi.patch<CategoryAttribute>(API_ENDPOINTS.attribute.categoryAttributeById(categoryId, id), request);
  }

  delete(categoryId: number, id: number): Observable<void> {
    return this.baseApi.delete<void>(API_ENDPOINTS.attribute.categoryAttributeById(categoryId, id));
  }
}
