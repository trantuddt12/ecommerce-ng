import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import {
  Category,
  CategoryMergeRequest,
  CategoryMoveRequest,
  CategoryMutationRequest,
  PagedResult,
  CategoryReorderRequest,
  CategoryTreeNode,
  ImageAsset,
} from '../models/catalog.models';
import { BaseApiService } from '../http/base-api.service';
import { QueryParamValue } from '../utils/query-params.util';

interface PageMeta {
  _totalElements?: number;
  _totalPages?: number;
  _currentPage?: number;
  _pageSize?: number;
}

interface PagedApiEnvelope<T> {
  data: T[];
  page?: PageMeta;
  timestamp?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly baseApi = inject(BaseApiService);

  list(filters?: Record<string, QueryParamValue>): Observable<Category[]> {
    return this.baseApi.get<Category[] | ApiEnvelope<Category[]>>(API_ENDPOINTS.category.list, filters).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  listPage(filters?: Record<string, QueryParamValue>): Observable<PagedResult<Category>> {
    return this.baseApi
      .get<PagedApiEnvelope<Category> | ApiEnvelope<Category[]>>(API_ENDPOINTS.category.list, filters)
      .pipe(map((response) => this.mapPagedCategories(response, filters)));
  }

  tree(filters?: Record<string, string | number | boolean | null | undefined>): Observable<CategoryTreeNode[]> {
    return this.baseApi.get<CategoryTreeNode[] | ApiEnvelope<CategoryTreeNode[]>>(API_ENDPOINTS.category.tree, filters).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  storefront(filters?: Record<string, QueryParamValue>): Observable<Category[]> {
    return this.baseApi.get<Category[] | ApiEnvelope<Category[]>>(API_ENDPOINTS.category.storefront, filters).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  storefrontTree(filters?: Record<string, string | number | boolean | null | undefined>): Observable<CategoryTreeNode[]> {
    return this.baseApi.get<CategoryTreeNode[] | ApiEnvelope<CategoryTreeNode[]>>(API_ENDPOINTS.category.storefrontTree, filters).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  getStorefrontBySlug(slug: string): Observable<Category> {
    return this.baseApi.get<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.storefrontBySlug(slug)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  getById(id: number): Observable<Category> {
    return this.baseApi.get<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.byId(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  getBySlug(slug: string): Observable<Category> {
    return this.baseApi.get<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.bySlug(slug)).pipe(
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

  updateStatus(id: number, status: Category['status']): Observable<Category> {
    return this.baseApi.patch<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.status(id), { status }).pipe(
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

  addImages(id: number, files: File[]): Observable<Category> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    return this.baseApi.postFormData<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.images(id), formData).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  setThumbnail(id: number, imageId: number): Observable<Category> {
    return this.baseApi.patch<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.thumbnail(id, imageId), {}).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  deleteImage(id: number, imageId: number): Observable<Category> {
    return this.baseApi.delete<Category | ApiEnvelope<Category>>(API_ENDPOINTS.category.deleteImage(id, imageId)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  listImages(id: number): Observable<ImageAsset[]> {
    return this.baseApi.get<ImageAsset[] | ApiEnvelope<ImageAsset[]>>(API_ENDPOINTS.category.images(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  private mapPagedCategories(
    response: PagedApiEnvelope<Category> | ApiEnvelope<Category[]>,
    fallback?: Record<string, QueryParamValue>,
  ): PagedResult<Category> {
    const envelope = response as PagedApiEnvelope<Category>;
    const items = Array.isArray(envelope?.data) ? envelope.data : [];
    const page = envelope?.page;

    return {
      items,
      totalElements: page?._totalElements ?? items.length,
      totalPages: page?._totalPages ?? 1,
      page: page?._currentPage ?? Number(fallback?.['page'] ?? 0),
      size: page?._pageSize ?? Number(fallback?.['size'] ?? items.length),
    };
  }
}
