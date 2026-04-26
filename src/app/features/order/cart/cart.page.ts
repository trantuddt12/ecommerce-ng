import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { AppConfig } from '../../../core/config/app-config.model';
import { Cart, CartItem } from '../../../core/models/order.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthStore } from '../../../core/state/auth.store';
import { CartStore } from '../../../core/state/cart.store';
import { APP_CONFIG } from '../../../core/tokens/app-config.token';
import { resolveMediaUrl } from '../../../core/utils/media-url.util';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  template: `
    <section class="cart-page">
      <mat-card class="cart-hero">
        <mat-card-content>
          <div>
            <p class="cart-eyebrow">Cart</p>
            <h2>Gio hang cua ban</h2>
            <p>Gia, ton kho va voucher luon duoc dong bo theo response moi nhat tu backend.</p>
          </div>
          <div class="cart-hero-actions">
            <button mat-stroked-button type="button" (click)="reloadCart()" [disabled]="busy()">Tai lai</button>
            <a mat-flat-button color="primary" [routerLink]="APP_ROUTES.homeProducts">Tiep tuc mua sam</a>
          </div>
        </mat-card-content>
      </mat-card>

      @if (!authStore.isAuthenticated()) {
        <mat-card class="cart-panel">
          <mat-card-content class="cart-empty-state">
            <h3>Dang nhap de xem gio hang</h3>
            <p>Cart hien tai chi ho tro cho tai khoan da dang nhap.</p>
            <a mat-flat-button color="primary" [routerLink]="APP_ROUTES.login">Dang nhap</a>
          </mat-card-content>
        </mat-card>
      } @else {
        @if (cartStore.isLoading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }

        @if (cartStore.cartError()) {
          <div class="cart-error">{{ cartStore.cartError() }}</div>
        }

        <section class="cart-grid">
          <mat-card class="cart-panel cart-span-8">
            <mat-card-content>
              <div class="cart-section-header">
                <div>
                  <h3>Danh sach san pham</h3>
                  <p>Moi thao tac quantity va remove se thay bang toan bo state cart moi nhat.</p>
                </div>
                @if (cart(); as currentCart) {
                  <span class="cart-updated">Cap nhat: {{ currentCart.updatedAt ? (currentCart.updatedAt | date: 'dd/MM/yyyy HH:mm') : 'vua xong' }}</span>
                }
              </div>

              @if (cart()?.items?.length) {
                <div class="cart-item-list">
                  @for (item of cart()!.items; track item.variantId) {
                    <article class="cart-item-card">
                      <div class="cart-item-media">
                        @if (resolveItemImageUrl(item); as imageUrl) {
                          <img [src]="imageUrl" [alt]="itemDisplayName(item)" />
                        } @else {
                          <div class="cart-item-placeholder">{{ itemInitial(item) }}</div>
                        }
                      </div>

                      <div class="cart-item-main">
                        <div class="cart-item-copy">
                          <div>
                            <h4>{{ itemDisplayName(item) }}</h4>
                            <p>{{ item.variantName || item.sku }}</p>
                            @if (item.variantAttributes) {
                              <p>{{ item.variantAttributes }}</p>
                            }
                          </div>
                          <div class="cart-item-price">
                            <strong>{{ formatCurrency(item.unitPrice, cart()?.currencyCode) }}</strong>
                            @if (item.compareAtPrice && item.compareAtPrice > item.unitPrice) {
                              <span>{{ formatCurrency(item.compareAtPrice, cart()?.currencyCode) }}</span>
                            }
                          </div>
                        </div>

                        <div class="cart-item-meta">
                          <div class="cart-stock-group">
                            <span class="cart-stock-chip" [class.warn]="hasInventoryIssue(item)">
                              {{ inventoryLabel(item) }}
                            </span>
                            @if (item.lowStockMessage) {
                              <span class="cart-low-stock">{{ item.lowStockMessage }}</span>
                            }
                          </div>

                          <div class="cart-item-actions">
                            <div class="cart-quantity-box">
                              <button mat-icon-button type="button" (click)="decreaseQuantity(item)" [disabled]="busy()">
                                <mat-icon>remove</mat-icon>
                              </button>
                              <span>{{ item.quantity }}</span>
                              <button mat-icon-button type="button" (click)="increaseQuantity(item)" [disabled]="busy() || !canIncrease(item)">
                                <mat-icon>add</mat-icon>
                              </button>
                            </div>
                            <button mat-button color="warn" type="button" (click)="removeItem(item)" [disabled]="busy()">Xoa</button>
                          </div>
                        </div>
                      </div>

                      <div class="cart-line-total">
                        <span>Tam tinh</span>
                        <strong>{{ formatCurrency(item.lineSubtotal, cart()?.currencyCode) }}</strong>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div class="cart-empty-state">
                  <h3>Gio hang dang trong</h3>
                  <p>Backend se tu tao cart rong cho user, ban co the them san pham tu trang mua sam.</p>
                  <a mat-flat-button color="primary" [routerLink]="APP_ROUTES.homeProducts">Den trang san pham</a>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-card class="cart-panel cart-span-4">
            <mat-card-content>
              <div class="cart-section-header">
                <div>
                  <h3>Tong ket don hang</h3>
                  <p>Khong tinh tong tien o local, luon lay tu cart/pricing preview.</p>
                </div>
              </div>

              @if (cart(); as currentCart) {
                <div class="cart-summary">
                  <div><span>So luong</span><strong>{{ currentCart.totalItems }}</strong></div>
                  <div><span>Tam tinh</span><strong>{{ formatCurrency(currentCart.subtotalAmount, currentCart.currencyCode) }}</strong></div>
                  <div><span>Giam gia</span><strong>-{{ formatCurrency(pricingPreview()?.discountAmount ?? currentCart.discountAmount, currentCart.currencyCode) }}</strong></div>
                  <div><span>Van chuyen</span><strong>{{ formatCurrency(pricingPreview()?.shippingFee ?? 0, currentCart.currencyCode) }}</strong></div>
                  <div class="cart-grand-total"><span>Thanh tien</span><strong>{{ formatCurrency(pricingPreview()?.grandTotal ?? currentCart.grandTotal, currentCart.currencyCode) }}</strong></div>
                </div>

                <div class="cart-alert-box">
                  <strong>{{ checkoutStatusLabel() }}</strong>
                  <p>Gia va ton kho co the thay doi tai thoi diem thanh toan. Luon kiem tra lai truoc khi dat hang.</p>
                </div>

                <div class="cart-voucher-box">
                  <h4>Voucher</h4>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Nhap ma voucher</mat-label>
                    <input matInput [value]="voucherCodeInput()" (input)="setVoucherCode($any($event.target).value)" [disabled]="busy()" />
                  </mat-form-field>

                  @if (cartStore.voucherError()) {
                    <div class="cart-voucher-error">{{ cartStore.voucherError() }}</div>
                  }

                  @if (currentCart.voucherCode) {
                    <div class="cart-voucher-active">
                      <div>
                        <strong>{{ currentCart.voucherCode }}</strong>
                        <p>{{ voucherDescription(currentCart) }}</p>
                      </div>
                      <button mat-button type="button" (click)="removeVoucher()" [disabled]="busy()">Go voucher</button>
                    </div>
                  } @else {
                    <button mat-flat-button color="primary" type="button" (click)="applyVoucher()" [disabled]="busy() || !voucherCodeInput().trim()">Ap dung voucher</button>
                  }
                </div>

                <div class="cart-checkout-actions">
                  <a mat-flat-button color="primary" [routerLink]="APP_ROUTES.cartCheckout" [class.disabled-link]="!canCheckout()">Tien hanh thanh toan</a>
                  <button mat-stroked-button type="button" (click)="reloadCart()" [disabled]="busy()">Dong bo lai</button>
                </div>
              } @else {
                <div class="cart-empty-state compact">
                  <p>Dang tai gio hang...</p>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </section>
      }
    </section>
  `,
  styles: [`
    .cart-page {
      display: grid;
      gap: 1.25rem;
    }

    .cart-hero {
      color: #fff;
      border-radius: 1.2rem;
      background:
        radial-gradient(circle at 82% 15%, rgba(56, 189, 248, 0.32), transparent 40%),
        linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 64, 175, 0.92) 55%, rgba(14, 116, 144, 0.9) 100%);
    }

    .cart-hero .mat-mdc-card-content {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      padding: 1.4rem;
      flex-wrap: wrap;
    }

    .cart-eyebrow {
      margin: 0 0 0.45rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.74rem;
      color: rgba(191, 219, 254, 0.94);
    }

    .cart-hero h2,
    .cart-hero p {
      margin: 0;
    }

    .cart-hero p {
      color: rgba(224, 242, 254, 0.92);
    }

    .cart-hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .cart-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1.25rem;
      align-items: start;
    }

    .cart-span-8 {
      grid-column: span 8;
    }

    .cart-span-4 {
      grid-column: span 4;
      position: sticky;
      top: 5.5rem;
    }

    .cart-panel {
      border-radius: 1.1rem;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: #fff;
    }

    .cart-panel .mat-mdc-card-content {
      display: grid;
      gap: 1rem;
      padding: 1.15rem;
    }

    .cart-section-header {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .cart-section-header h3,
    .cart-item-copy h4,
    .cart-voucher-box h4 {
      margin: 0;
      color: #0f172a;
    }

    .cart-section-header p,
    .cart-updated,
    .cart-item-copy p,
    .cart-voucher-active p,
    .cart-alert-box p,
    .cart-empty-state p {
      margin: 0.25rem 0 0;
      color: #64748b;
    }

    .cart-item-list {
      display: grid;
      gap: 0.9rem;
    }

    .cart-item-card {
      display: grid;
      grid-template-columns: 7rem minmax(0, 1fr) auto;
      gap: 1rem;
      padding: 1rem;
      border-radius: 1rem;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(255, 255, 255, 0.92);
    }

    .cart-item-media {
      width: 7rem;
      height: 7rem;
      border-radius: 0.95rem;
      overflow: hidden;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cart-item-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cart-item-placeholder {
      font-size: 2rem;
      color: #475569;
    }

    .cart-item-main,
    .cart-item-copy,
    .cart-item-meta,
    .cart-stock-group,
    .cart-summary,
    .cart-voucher-box,
    .cart-line-total,
    .cart-checkout-actions {
      display: grid;
      gap: 0.75rem;
    }

    .cart-item-copy {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
    }

    .cart-item-price {
      display: grid;
      justify-items: end;
      gap: 0.2rem;
    }

    .cart-item-price span {
      color: #94a3b8;
      text-decoration: line-through;
    }

    .cart-item-meta {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
    }

    .cart-item-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .cart-quantity-box {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.15rem 0.35rem;
      border-radius: 999px;
      border: 1px solid rgba(148, 163, 184, 0.28);
      background: #fff;
    }

    .cart-quantity-box span {
      min-width: 2rem;
      text-align: center;
      font-weight: 600;
      color: #0f172a;
    }

    .cart-stock-chip {
      width: fit-content;
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      background: rgba(219, 234, 254, 0.78);
      color: #1d4ed8;
      font-weight: 600;
    }

    .cart-stock-chip.warn {
      background: rgba(254, 243, 199, 0.9);
      color: #b45309;
    }

    .cart-low-stock,
    .cart-voucher-error,
    .cart-error {
      color: #b91c1c;
    }

    .cart-line-total {
      justify-items: end;
      min-width: 7rem;
      color: #64748b;
    }

    .cart-line-total strong,
    .cart-grand-total strong {
      color: #0f172a;
    }

    .cart-summary {
      padding: 1rem;
      border-radius: 0.95rem;
      background: rgba(240, 249, 255, 0.78);
      border: 1px solid rgba(125, 211, 252, 0.28);
    }

    .cart-summary div,
    .cart-grand-total {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
    }

    .cart-grand-total {
      padding-top: 0.8rem;
      border-top: 1px dashed rgba(14, 116, 144, 0.28);
    }

    .cart-alert-box,
    .cart-voucher-active,
    .cart-empty-state {
      padding: 0.95rem 1rem;
      border-radius: 0.95rem;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: #fff;
    }

    .cart-alert-box {
      background: rgba(239, 246, 255, 0.85);
      border-color: rgba(96, 165, 250, 0.22);
    }

    .cart-voucher-active {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cart-checkout-actions a,
    .cart-checkout-actions button {
      width: 100%;
    }

    .disabled-link {
      pointer-events: none;
      opacity: 0.55;
    }

    .cart-error {
      padding: 0.85rem 1rem;
      border-radius: 0.95rem;
      background: rgba(254, 226, 226, 0.72);
      border: 1px solid rgba(248, 113, 113, 0.26);
    }

    @media (max-width: 1180px) {
      .cart-span-8,
      .cart-span-4 {
        grid-column: span 12;
      }

      .cart-span-4 {
        position: static;
      }
    }

    @media (max-width: 820px) {
      .cart-item-card {
        grid-template-columns: 1fr;
      }

      .cart-item-media {
        width: 100%;
        height: 12rem;
      }

      .cart-item-copy,
      .cart-item-meta {
        grid-template-columns: 1fr;
      }

      .cart-line-total {
        justify-items: start;
      }

      .cart-voucher-active {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class CartPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly authStore = inject(AuthStore);
  protected readonly cartStore = inject(CartStore);
  private readonly notificationService = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly router = inject(Router);
  private readonly appConfig = inject(APP_CONFIG);

  protected readonly voucherCodeInput = signal('');
  protected readonly cart = this.cartStore.cart;
  protected readonly pricingPreview = this.cartStore.pricingPreview;
  protected readonly busy = computed(() => this.cartStore.isLoading() || this.cartStore.isMutating());
  protected readonly canCheckout = computed(() => {
    const currentCart = this.cart();
    if (!currentCart || !currentCart.items.length) {
      return false;
    }

    return currentCart.items.every((item) => (item.canCheckout ?? true) && item.quantity <= (item.availableQty ?? item.quantity));
  });

  constructor() {
    if (this.authStore.isAuthenticated()) {
      this.reloadCart();
    }
  }

  protected reloadCart(): void {
    if (!this.authStore.isAuthenticated()) {
      return;
    }

    this.cartStore.resetTransientErrors();
    this.cartStore.refreshCartAndPricing().subscribe({
      error: (error) => {
        const mapped = this.errorMapper.map(error);
        this.cartStore.setCartError(mapped.message);
      },
    });
  }

  protected increaseQuantity(item: CartItem): void {
    const nextQuantity = item.quantity + 1;
    if (!this.canIncrease(item)) {
      this.notificationService.info('So luong da dat muc ton kha dung hien tai.');
      return;
    }

    this.updateQuantity(item, nextQuantity);
  }

  protected decreaseQuantity(item: CartItem): void {
    const nextQuantity = item.quantity - 1;
    if (nextQuantity <= 0) {
      this.removeItem(item);
      return;
    }

    this.updateQuantity(item, nextQuantity);
  }

  protected removeItem(item: CartItem): void {
    this.cartStore.removeItem(item.variantId).pipe(
      finalize(() => this.cartStore.loadPricingPreview().subscribe({ error: () => undefined })),
    ).subscribe({
      next: () => {
        this.notificationService.success(`Da xoa ${this.itemDisplayName(item)} khoi gio hang.`);
      },
      error: (error) => {
        const mapped = this.errorMapper.map(error);
        this.cartStore.setCartError(mapped.message);
        this.notificationService.error(mapped.message);
      },
    });
  }

  protected applyVoucher(): void {
    const voucherCode = this.voucherCodeInput().trim();
    if (!voucherCode) {
      this.cartStore.setVoucherError('Vui long nhap ma voucher.');
      return;
    }

    this.cartStore.applyVoucher({ voucherCode }).pipe(
      finalize(() => this.cartStore.loadPricingPreview().subscribe({ error: () => undefined })),
    ).subscribe({
      next: () => {
        this.voucherCodeInput.set('');
        this.notificationService.success('Ap dung voucher thanh cong.');
      },
      error: (error) => {
        const mapped = this.errorMapper.map(error);
        this.cartStore.setVoucherError(mapped.message);
      },
    });
  }

  protected removeVoucher(): void {
    this.cartStore.removeVoucher().pipe(
      finalize(() => this.cartStore.loadPricingPreview().subscribe({ error: () => undefined })),
    ).subscribe({
      next: () => {
        this.notificationService.success('Da go voucher khoi gio hang.');
      },
      error: (error) => {
        const mapped = this.errorMapper.map(error);
        this.cartStore.setVoucherError(mapped.message);
      },
    });
  }

  protected setVoucherCode(value: string): void {
    this.voucherCodeInput.set(value);
    if (this.cartStore.voucherError()) {
      this.cartStore.setVoucherError(null);
    }
  }

  protected canIncrease(item: CartItem): boolean {
    const availableQty = item.availableQty;
    if (availableQty === null || availableQty === undefined) {
      return true;
    }

    return item.quantity < availableQty;
  }

  protected hasInventoryIssue(item: CartItem): boolean {
    return item.inventoryStatus === 'OUT_OF_STOCK'
      || Boolean(item.lowStockMessage)
      || item.quantity > (item.availableQty ?? item.quantity)
      || item.canCheckout === false;
  }

  protected inventoryLabel(item: CartItem): string {
    if (item.inventoryStatus === 'OUT_OF_STOCK') {
      return 'Het hang';
    }

    if (item.quantity > (item.availableQty ?? item.quantity)) {
      return 'Vuot ton kha dung';
    }

    if (item.inventoryStatus === 'LOW_STOCK') {
      return `Sap het hang${item.availableQty !== null && item.availableQty !== undefined ? ` · con ${item.availableQty}` : ''}`;
    }

    if (item.availableQty !== null && item.availableQty !== undefined) {
      return `Con ${item.availableQty} san pham`;
    }

    return item.inventoryStatus || 'Con hang';
  }

  protected checkoutStatusLabel(): string {
    return this.canCheckout() ? 'Cart san sang checkout' : 'Can cap nhat lai cart truoc khi checkout';
  }

  protected voucherDescription(cart: Cart): string {
    if (!cart.voucherCode) {
      return 'Chua ap dung voucher';
    }

    if (cart.voucherType === 'PERCENT') {
      return `Giam ${cart.voucherValue ?? 0}% tren tong tam tinh`;
    }

    return `Giam ${this.formatCurrency(cart.discountAmount, cart.currencyCode)}`;
  }

  protected resolveItemImageUrl(item: CartItem): string | null {
    return resolveMediaUrl(item.imageUrl, this.appConfig.apiBaseUrl);
  }

  protected itemDisplayName(item: CartItem): string {
    return item.productName || item.productCode || item.sku || `San pham #${item.productId}`;
  }

  protected itemInitial(item: CartItem): string {
    return this.itemDisplayName(item).trim().charAt(0).toUpperCase() || '#';
  }

  protected formatCurrency(value: number | null | undefined, currencyCode: string | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${value.toLocaleString('vi-VN')} ${currencyCode || 'VND'}`;
  }

  private updateQuantity(item: CartItem, quantity: number): void {
    this.cartStore.upsertItem({ variantId: item.variantId, quantity }).pipe(
      finalize(() => this.cartStore.loadPricingPreview().subscribe({ error: () => undefined })),
    ).subscribe({
      next: () => {
        this.notificationService.success(`Da cap nhat ${this.itemDisplayName(item)} thanh so luong ${quantity}.`);
      },
      error: (error) => {
        const mapped = this.errorMapper.map(error);
        this.cartStore.setCartError(mapped.message);
        this.notificationService.error(mapped.message);
      },
    });
  }
}
