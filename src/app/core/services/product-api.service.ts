import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { AdminProductDetail, AdminProductListItem, AdminProductUpsertRequest, ProductFilter, ProductImage } from '../models/catalog.models';
import { QueryParamValue } from '../utils/query-params.util';

export type ProductStatusValue = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly baseApi = inject(BaseApiService);

  list(filters?: ProductFilter): Observable<AdminProductListItem[]> {
    return this.baseApi.get<AdminProductListItem[] | ApiEnvelope<AdminProductListItem[]>>(API_ENDPOINTS.product.list, this.toQueryParams(filters)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  storefront(filters?: ProductFilter): Observable<AdminProductListItem[]> {
    return this.baseApi.get<AdminProductListItem[] | ApiEnvelope<AdminProductListItem[]>>(API_ENDPOINTS.product.storefront, this.toQueryParams(filters)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  getById(id: number): Observable<AdminProductDetail> {
    return this.baseApi.get<AdminProductDetail | ApiEnvelope<AdminProductDetail>>(API_ENDPOINTS.product.byId(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: AdminProductUpsertRequest, files: File[]): Observable<AdminProductDetail> {
    return this.baseApi.postFormData<AdminProductDetail | ApiEnvelope<AdminProductDetail>>(
      API_ENDPOINTS.product.create,
      createProductFormData(request, files),
    ).pipe(map((response) => unwrapApiEnvelope(response)));
  }

  update(id: number, request: AdminProductUpsertRequest): Observable<AdminProductDetail> {
    return this.baseApi.patch<AdminProductDetail | ApiEnvelope<AdminProductDetail>>(API_ENDPOINTS.product.update(id), request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  updateStatus(id: number, status: ProductStatusValue): Observable<AdminProductDetail> {
    return this.baseApi.patch<AdminProductDetail | ApiEnvelope<AdminProductDetail>>(API_ENDPOINTS.product.status(id), { status }).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  listImages(id: number): Observable<ProductImage[]> {
    return this.baseApi.get<ProductImage[] | ApiEnvelope<ProductImage[]>>(API_ENDPOINTS.product.images(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  addImages(id: number, files: File[]): Observable<AdminProductDetail> {
    return this.baseApi.postFormData<AdminProductDetail | ApiEnvelope<AdminProductDetail>>(
      API_ENDPOINTS.product.images(id),
      createProductImagesFormData(files),
    ).pipe(map((response) => unwrapApiEnvelope(response)));
  }

  setThumbnail(id: number, imageId: number): Observable<AdminProductDetail> {
    return this.baseApi.patch<AdminProductDetail | ApiEnvelope<AdminProductDetail>>(API_ENDPOINTS.product.thumbnail(id, imageId), {}).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  deleteImage(id: number, imageId: number): Observable<AdminProductDetail> {
    return this.baseApi.delete<AdminProductDetail | ApiEnvelope<AdminProductDetail>>(API_ENDPOINTS.product.deleteImage(id, imageId)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  private toQueryParams(filters?: ProductFilter): Record<string, QueryParamValue> | undefined {
    if (!filters) {
      return undefined;
    }

    return {
      categoryId: toNullableNumber(filters.categoryId),
      brandId: toNullableNumber(filters.brandId),
      minPrice: toNullableNumber(filters.minPrice),
      maxPrice: toNullableNumber(filters.maxPrice),
      status: filters.status ?? null,
      keyword: filters.keyword ?? null,
    };
  }
}

function toNullableNumber(value: number | null | undefined): QueryParamValue {
  return value ?? null;
}

export function createProductFormData(request: AdminProductUpsertRequest, files: File[]): FormData {
  const formData = new FormData();
  formData.append('product', JSON.stringify(request));

  for (const file of files) {
    formData.append('images', file);
  }

  return formData;
}

function createProductImagesFormData(files: File[]): FormData {
  const formData = new FormData();
  for (const file of files) {
    formData.append('images', file);
  }
  return formData;
}
