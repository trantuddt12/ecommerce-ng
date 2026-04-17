import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { Product, ProductCreateRequest, ProductFilter, ProductResponse } from '../models/catalog.models';
import { QueryParamValue } from '../utils/query-params.util';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly baseApi = inject(BaseApiService);

  list(filters?: ProductFilter): Observable<Product[]> {
    return this.baseApi.get<Product[] | ApiEnvelope<Product[]>>(API_ENDPOINTS.product.list, this.toQueryParams(filters)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  getById(id: number): Observable<Product> {
    return this.baseApi.get<Product | ApiEnvelope<Product>>(API_ENDPOINTS.product.byId(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: ProductCreateRequest, files: File[]): Observable<ProductResponse> {
    return this.baseApi.postFormData<ProductResponse>(
      API_ENDPOINTS.product.create,
      createProductFormData(request, files),
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

export function createProductFormData(request: ProductCreateRequest, files: File[]): FormData {
  const formData = new FormData();
  formData.append('product', JSON.stringify(request));

  for (const file of files) {
    formData.append('images', file);
  }

  return formData;
}
