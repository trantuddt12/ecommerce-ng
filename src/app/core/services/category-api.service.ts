import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import {
  Category,
  CategoryMergeRequest,
  CategoryMoveRequest,
  CategoryMutationRequest,
  CategoryReorderRequest,
  CategoryTreeNode,
} from '../models/catalog.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly baseApi = inject(BaseApiService);

  list(filters?: Record<string, string | number | boolean | null | undefined>): Observable<Category[]> {
    return this.baseApi.get<Category[] | ApiEnvelope<Category[]>>(API_ENDPOINTS.category.list, filters).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  tree(filters?: Record<string, string | number | boolean | null | undefined>): Observable<CategoryTreeNode[]> {
    return this.baseApi.get<CategoryTreeNode[] | ApiEnvelope<CategoryTreeNode[]>>(API_ENDPOINTS.category.tree, filters).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: CategoryMutationRequest): Observable<Category> {
    return this.baseApi.post<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.create, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  update(id: number, request: CategoryMutationRequest): Observable<Category> {
    return this.baseApi.patch<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.update(id), request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  deleted(): Observable<Category[]> {
    return this.baseApi.get<Category[] | ApiEnvelope<Category[]>>(API_ENDPOINTS.category.deleted).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  deactivate(id: number): Observable<Category> {
    return this.baseApi.post<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.deactivate(id), {}).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  move(id: number, request: CategoryMoveRequest): Observable<Category> {
    return this.baseApi.patch<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.move(id), request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  reorder(request: CategoryReorderRequest): Observable<Category[]> {
    return this.baseApi.patch<Category[] | ApiEnvelope<Category[]>>(API_ENDPOINTS.category.reorder, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  merge(request: CategoryMergeRequest): Observable<Category> {
    return this.baseApi.post<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.merge, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  delete(id: number): Observable<void> {
    return this.baseApi.delete<void>(API_ENDPOINTS.category.delete(id));
  }
}
