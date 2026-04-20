import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { QueryParamValue } from '../utils/query-params.util';
import {
  CustomerOrderCancelRequest,
  OrderAdminStatusUpdateRequest,
  OrderDetail,
  OrderListFilters,
  OrderListItem,
  PagedResult,
} from '../models/order.models';

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
export class OrderApiService {
  private readonly baseApi = inject(BaseApiService);

  list(filters?: OrderListFilters): Observable<PagedResult<OrderListItem>> {
    return this.baseApi
      .get<PagedApiEnvelope<OrderListItem> | ApiEnvelope<OrderListItem[]>>(API_ENDPOINTS.order.list, this.toQueryParams(filters))
      .pipe(map((response) => this.mapPagedOrders(response, filters)));
  }

  getById(id: number): Observable<OrderDetail> {
    return this.baseApi.get<OrderDetail | ApiEnvelope<OrderDetail>>(API_ENDPOINTS.order.byId(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  updateAdminStatus(id: number, request: OrderAdminStatusUpdateRequest): Observable<OrderDetail> {
    return this.baseApi
      .patch<OrderDetail | ApiEnvelope<OrderDetail>>(API_ENDPOINTS.order.adminStatus(id), request)
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }

  listMyOrders(filters?: Pick<OrderListFilters, 'page' | 'size' | 'sortBy' | 'sortDir'>): Observable<PagedResult<OrderListItem>> {
    return this.baseApi
      .get<PagedApiEnvelope<OrderListItem> | ApiEnvelope<OrderListItem[]>>(API_ENDPOINTS.order.myList, this.toQueryParams(filters))
      .pipe(map((response) => this.mapPagedOrders(response, filters)));
  }

  getMyOrderById(id: number): Observable<OrderDetail> {
    return this.baseApi.get<OrderDetail | ApiEnvelope<OrderDetail>>(API_ENDPOINTS.order.myById(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  cancelMyOrder(id: number, request: CustomerOrderCancelRequest): Observable<OrderDetail> {
    return this.baseApi
      .patch<OrderDetail | ApiEnvelope<OrderDetail>>(API_ENDPOINTS.order.myCancel(id), request)
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }

  private mapPagedOrders(
    response: PagedApiEnvelope<OrderListItem> | ApiEnvelope<OrderListItem[]>,
    fallback?: { page?: number; size?: number },
  ): PagedResult<OrderListItem> {
    const envelope = response as PagedApiEnvelope<OrderListItem>;
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

  private toQueryParams(filters?: OrderListFilters | Pick<OrderListFilters, 'page' | 'size' | 'sortBy' | 'sortDir'>): Record<string, QueryParamValue> | undefined {
    if (!filters) {
      return undefined;
    }

    return {
      orderNumber: 'orderNumber' in filters ? filters.orderNumber ?? null : null,
      orderStatus: 'orderStatus' in filters ? filters.orderStatus ?? null : null,
      paymentStatus: 'paymentStatus' in filters ? filters.paymentStatus ?? null : null,
      customerPhone: 'customerPhone' in filters ? filters.customerPhone ?? null : null,
      page: filters.page ?? null,
      size: filters.size ?? null,
      sortBy: filters.sortBy ?? null,
      sortDir: filters.sortDir ?? null,
    };
  }
}
