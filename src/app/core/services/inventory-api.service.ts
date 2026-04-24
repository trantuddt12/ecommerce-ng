import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import {
  AdminInventoryAdjustmentRequest,
  AdminInventoryDetail,
  AdminInventoryListItem,
  InventoryMovement,
  InventoryQuery,
  PagedResult,
} from '../models/catalog.models';
import { ApiEnvelope } from '../models/auth.models';
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
export class InventoryApiService {
  private readonly baseApi = inject(BaseApiService);

  list(query?: InventoryQuery): Observable<PagedResult<AdminInventoryListItem>> {
    return this.baseApi
      .get<PagedApiEnvelope<AdminInventoryListItem> | ApiEnvelope<AdminInventoryListItem[]>>(
        API_ENDPOINTS.inventory.list,
        this.toQueryParams(query),
      )
      .pipe(map((response) => this.mapPagedInventories(response, query)));
  }

  getByVariantId(variantId: number): Observable<AdminInventoryDetail> {
    return this.baseApi
      .get<AdminInventoryDetail | ApiEnvelope<AdminInventoryDetail>>(API_ENDPOINTS.inventory.byVariantId(variantId))
      .pipe(map((response) => this.unwrap(response)));
  }

  getMovements(variantId: number, limit = 20): Observable<InventoryMovement[]> {
    return this.baseApi
      .get<InventoryMovement[] | ApiEnvelope<InventoryMovement[]>>(API_ENDPOINTS.inventory.movements(variantId), { limit })
      .pipe(map((response) => this.unwrap(response)));
  }

  adjust(variantId: number, request: AdminInventoryAdjustmentRequest): Observable<AdminInventoryDetail> {
    return this.baseApi
      .post<AdminInventoryDetail | ApiEnvelope<AdminInventoryDetail>>(API_ENDPOINTS.inventory.adjustments(variantId), request)
      .pipe(map((response) => this.unwrap(response)));
  }

  private unwrap<T>(response: T | ApiEnvelope<T>): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private mapPagedInventories(
    response: PagedApiEnvelope<AdminInventoryListItem> | ApiEnvelope<AdminInventoryListItem[]>,
    fallback?: InventoryQuery,
  ): PagedResult<AdminInventoryListItem> {
    const envelope = response as PagedApiEnvelope<AdminInventoryListItem>;
    const items = Array.isArray(envelope?.data) ? envelope.data : [];
    const page = envelope?.page;

    return {
      items,
      totalElements: page?._totalElements ?? items.length,
      totalPages: page?._totalPages ?? 1,
      page: page?._currentPage ?? fallback?.page ?? 0,
      size: page?._pageSize ?? fallback?.size ?? items.length,
    };
  }

  private toQueryParams(query?: InventoryQuery): Record<string, QueryParamValue> | undefined {
    if (!query) {
      return undefined;
    }

    return {
      keyword: query.keyword ?? null,
      inventoryStatus: query.inventoryStatus ?? null,
      categoryId: query.categoryId ?? null,
      brandId: query.brandId ?? null,
      page: query.page ?? null,
      size: query.size ?? null,
      sortBy: query.sortBy ?? null,
      sortDir: query.sortDir ?? null,
    };
  }
}
