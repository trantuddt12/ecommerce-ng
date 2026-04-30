import { Injectable, effect, inject, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import {
  Cart,
  CartApplyVoucherRequest,
  CartItemUpsertRequest,
  CheckoutFromCartRequest,
  CheckoutPricingPreview,
  OrderDetail,
} from '../models/order.models';
import { CartApiService } from '../services/cart-api.service';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly cartApi = inject(CartApiService);
  private readonly authStore = inject(AuthStore);
  private readonly cartLoaded = signal(false);

  readonly cart = signal<Cart | null>(null);
  readonly pricingPreview = signal<CheckoutPricingPreview | null>(null);
  readonly isLoading = signal(false);
  readonly isMutating = signal(false);
  readonly isCheckoutSubmitting = signal(false);
  readonly cartError = signal<string | null>(null);
  readonly voucherError = signal<string | null>(null);
  readonly checkoutError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this.authStore.authInitialized()) {
        return;
      }

      if (this.authStore.isAuthenticated()) {
        if (!this.cartLoaded()) {
          this.loadCart().subscribe({
            error: () => undefined,
          });
        }
        return;
      }

      this.reset();
    }, { allowSignalWrites: true });
  }

  loadCart(): Observable<Cart> {
    this.isLoading.set(true);
    this.cartError.set(null);

    return this.cartApi.getMyCart().pipe(
      tap((cart) => {
        this.cart.set(cart);
        this.cartLoaded.set(true);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  loadPricingPreview(): Observable<CheckoutPricingPreview> {
    this.isLoading.set(true);
    this.cartError.set(null);

    return this.cartApi.previewPricing().pipe(
      tap((preview) => {
        this.pricingPreview.set(preview);
        this.cartLoaded.set(true);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  refreshCartAndPricing(): Observable<[Cart, CheckoutPricingPreview]> {
    return new Observable<[Cart, CheckoutPricingPreview]>((subscriber) => {
      let cartValue: Cart | null = null;

      this.loadCart().subscribe({
        next: (cart) => {
          cartValue = cart;
          this.loadPricingPreview().subscribe({
            next: (preview) => {
              subscriber.next([cart, preview]);
              subscriber.complete();
            },
            error: (error) => subscriber.error(error),
          });
        },
        error: (error) => subscriber.error(error),
      });

      return () => {
        cartValue = null;
      };
    });
  }

  upsertItem(request: CartItemUpsertRequest): Observable<Cart> {
    this.isMutating.set(true);
    this.cartError.set(null);

    return this.cartApi.upsertItem(request).pipe(
      tap((cart) => this.cart.set(cart)),
      finalize(() => this.isMutating.set(false)),
    );
  }

  removeItem(variantId: number): Observable<Cart> {
    this.isMutating.set(true);
    this.cartError.set(null);

    return this.cartApi.removeItem(variantId).pipe(
      tap((cart) => this.cart.set(cart)),
      finalize(() => this.isMutating.set(false)),
    );
  }

  applyVoucher(request: CartApplyVoucherRequest): Observable<Cart> {
    this.isMutating.set(true);
    this.voucherError.set(null);

    return this.cartApi.applyVoucher(request).pipe(
      tap((cart) => this.cart.set(cart)),
      finalize(() => this.isMutating.set(false)),
    );
  }

  removeVoucher(): Observable<Cart> {
    this.isMutating.set(true);
    this.voucherError.set(null);

    return this.cartApi.removeVoucher().pipe(
      tap((cart) => this.cart.set(cart)),
      finalize(() => this.isMutating.set(false)),
    );
  }

  checkout(request: CheckoutFromCartRequest): Observable<OrderDetail> {
    this.isCheckoutSubmitting.set(true);
    this.checkoutError.set(null);

    return this.cartApi.checkout(request).pipe(
      tap(() => {
        this.cart.set(null);
        this.pricingPreview.set(null);
        this.cartLoaded.set(false);
      }),
      finalize(() => this.isCheckoutSubmitting.set(false)),
    );
  }

  setCartError(message: string | null): void {
    this.cartError.set(message);
  }

  setVoucherError(message: string | null): void {
    this.voucherError.set(message);
  }

  setCheckoutError(message: string | null): void {
    this.checkoutError.set(message);
  }

  resetTransientErrors(): void {
    this.cartError.set(null);
    this.voucherError.set(null);
    this.checkoutError.set(null);
  }

  private reset(): void {
    this.cart.set(null);
    this.pricingPreview.set(null);
    this.cartError.set(null);
    this.voucherError.set(null);
    this.checkoutError.set(null);
    this.isLoading.set(false);
    this.isMutating.set(false);
    this.isCheckoutSubmitting.set(false);
    this.cartLoaded.set(false);
  }
}
