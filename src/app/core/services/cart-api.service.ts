import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import {
  Cart,
  CartApplyVoucherRequest,
  CartItemUpsertRequest,
  CheckoutFromCartRequest,
  CheckoutPricingPreview,
  OrderDetail,
} from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly baseApi = inject(BaseApiService);

  getMyCart(): Observable<Cart> {
    return this.baseApi.get<Cart | ApiEnvelope<Cart>>(API_ENDPOINTS.cart.my).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  upsertItem(request: CartItemUpsertRequest): Observable<Cart> {
    return this.baseApi.put<Cart | ApiEnvelope<Cart>>(API_ENDPOINTS.cart.upsertItem, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  removeItem(variantId: number): Observable<Cart> {
    return this.baseApi.delete<Cart | ApiEnvelope<Cart>>(API_ENDPOINTS.cart.removeItem(variantId)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  applyVoucher(request: CartApplyVoucherRequest): Observable<Cart> {
    return this.baseApi.post<Cart | ApiEnvelope<Cart>>(API_ENDPOINTS.cart.applyVoucher, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  removeVoucher(): Observable<Cart> {
    return this.baseApi.delete<Cart | ApiEnvelope<Cart>>(API_ENDPOINTS.cart.removeVoucher).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  previewPricing(): Observable<CheckoutPricingPreview> {
    return this.baseApi.get<CheckoutPricingPreview | ApiEnvelope<CheckoutPricingPreview>>(API_ENDPOINTS.cart.pricingPreview).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  checkout(request: CheckoutFromCartRequest): Observable<OrderDetail> {
    return this.baseApi.patch<OrderDetail | ApiEnvelope<OrderDetail>>(API_ENDPOINTS.cart.checkout, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }
}
