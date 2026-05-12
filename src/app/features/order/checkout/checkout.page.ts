import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { CheckoutFromCartRequest } from '../../../core/models/order.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CartStore } from '../../../core/state/cart.store';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  template: `
    <section class="order-page">
      <mat-card class="order-hero">
        <mat-card-content>
          <div>
            <p class="order-eyebrow">Checkout</p>
            <h2>Hoan tat don hang</h2>
            <p>Thong tin cart, pricing preview va order submit deu di truc tiep qua cart backend.</p>
          </div>
          <div class="order-hero-actions">
            <a mat-stroked-button [routerLink]="APP_ROUTES.cart">Ve gio hang</a>
            <button mat-flat-button color="primary" type="button" (click)="loadCartAndPricing()" [disabled]="loading()">Tai lai</button>
          </div>
        </mat-card-content>
      </mat-card>

      @if (cartStore.checkoutError()) {
        <div class="order-error">{{ cartStore.checkoutError() }}</div>
      }

      <section class="order-grid">
        <mat-card class="order-panel order-span-8">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            }

            <div class="order-panel-header">
              <div>
                <h3>Thong tin giao nhan</h3>
                <p>Validate client-side cho cac truong bat buoc toi thieu truoc khi submit.</p>
              </div>
            </div>

            <div class="order-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Ten nguoi nhan</mat-label>
                <input matInput [(ngModel)]="form.recipientName" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>So dien thoai</mat-label>
                <input matInput [(ngModel)]="form.recipientPhone" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ma tinh/thanh</mat-label>
                <input matInput [(ngModel)]="form.provinceCode" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ma quan/huyen</mat-label>
                <input matInput [(ngModel)]="form.districtCode" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ma phuong/xa</mat-label>
                <input matInput [(ngModel)]="form.wardCode" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Dia chi nhan hang</mat-label>
                <input matInput [(ngModel)]="form.addressLine1" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Dia chi bo sung</mat-label>
                <input matInput [(ngModel)]="form.addressLine2" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ma van chuyen</mat-label>
                <input matInput [(ngModel)]="form.shippingMethodCode" placeholder="GHN_STANDARD" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ten hinh thuc giao</mat-label>
                <input matInput [(ngModel)]="form.shippingMethodName" placeholder="Giao hang tieu chuan" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ma thanh toan</mat-label>
                <input matInput [(ngModel)]="form.paymentMethodCode" placeholder="COD" [disabled]="loading()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ten hinh thuc thanh toan</mat-label>
                <input matInput [(ngModel)]="form.paymentMethodName" placeholder="Thanh toan khi nhan hang" [disabled]="loading()" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Ghi chu khach hang</mat-label>
              <textarea matInput rows="3" [(ngModel)]="form.customerNote" [disabled]="loading()"></textarea>
            </mat-form-field>

            <div class="order-actions">
              <button mat-flat-button color="primary" type="button" (click)="checkout()" [disabled]="loading() || !canSubmit()">Dat hang</button>
              <a mat-stroked-button [routerLink]="APP_ROUTES.cart">Quay lai gio hang</a>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="order-panel order-span-4">
          <mat-card-content>
            <div class="order-panel-header">
              <div>
                <h3>Tom tat thanh toan</h3>
                <p>Du lieu hien thi theo cart/pricing preview moi nhat.</p>
              </div>
            </div>

            @if (cart(); as currentCart) {
              <div class="order-summary">
                <p><strong>So san pham:</strong> {{ currentCart.totalItems }}</p>
                <p><strong>Tam tinh:</strong> {{ formatCurrency(currentCart.subtotalAmount, currentCart.currencyCode) }}</p>
                <p><strong>Giam gia:</strong> {{ formatCurrency(pricingPreview()?.discountAmount ?? currentCart.discountAmount, currentCart.currencyCode) }}</p>
                <p><strong>Van chuyen:</strong> {{ formatCurrency(pricingPreview()?.shippingFee ?? 0, currentCart.currencyCode) }}</p>
                <p class="order-total"><strong>Thanh tien:</strong> {{ formatCurrency(pricingPreview()?.grandTotal ?? currentCart.grandTotal, currentCart.currencyCode) }}</p>
                <mat-chip class="order-chip">{{ checkoutAvailabilityLabel() }}</mat-chip>
              </div>

              @if (currentCart.voucherCode) {
                <div class="order-voucher-box">
                  <strong>Voucher: {{ currentCart.voucherCode }}</strong>
                  <span>{{ currentCart.voucherType === 'PERCENT' ? ('Giam ' + (currentCart.voucherValue ?? 0) + '%') : 'Da ap dung giam gia' }}</span>
                </div>
              }

              <div class="order-item-list">
                @for (item of currentCart.items; track item.variantId) {
                  <div class="order-item">
                    <div>
                      <strong>{{ item.productName }}</strong>
                      <div class="order-muted">{{ item.variantName || item.sku }}</div>
                      @if (item.variantAttributes) {
                        <div class="order-muted">{{ item.variantAttributes }}</div>
                      }
                      @if (item.lowStockMessage) {
                        <div class="order-stock-warning">{{ item.lowStockMessage }}</div>
                      } @else if (item.inventoryStatus === 'OUT_OF_STOCK') {
                        <div class="order-stock-warning">San pham da het hang.</div>
                      } @else if (item.quantity > (item.availableQty ?? item.quantity)) {
                        <div class="order-stock-warning">So luong dang vuot ton kha dung.</div>
                      }
                    </div>
                    <div class="order-item-right">
                      <span>x{{ item.quantity }}</span>
                      <strong>{{ formatCurrency(item.lineSubtotal, currentCart.currencyCode) }}</strong>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="order-empty">Gio hang dang trong hoac chua tai duoc.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [``],
})
export class CheckoutPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly cartStore = inject(CartStore);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly cart = this.cartStore.cart;
  protected readonly pricingPreview = this.cartStore.pricingPreview;
  protected readonly loading = computed(() => this.cartStore.isLoading() || this.cartStore.isCheckoutSubmitting());

  protected readonly form: CheckoutFromCartRequest = {
    recipientName: '',
    recipientPhone: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    addressLine1: '',
    addressLine2: '',
    shippingMethodCode: 'GHN_STANDARD',
    shippingMethodName: 'Giao hang tieu chuan',
    paymentMethodCode: 'COD',
    paymentMethodName: 'Thanh toan khi nhan hang',
    customerNote: '',
  };

  constructor() {
    this.loadCartAndPricing();
  }

  protected loadCartAndPricing(): void {
    this.cartStore.resetTransientErrors();
    this.cartStore.refreshCartAndPricing().subscribe({
      error: (error) => {
        const mapped = this.errorMapper.map(error);
        this.cartStore.setCheckoutError(mapped.message);
      },
    });
  }

  protected checkout(): void {
    if (!this.canSubmit()) {
      this.notifications.error('Gio hang hien tai chua san sang de checkout.');
      return;
    }

    if (!this.form.recipientName.trim() || !this.form.recipientPhone.trim() || !this.form.addressLine1.trim()) {
      this.notifications.error('Can nhap ten nguoi nhan, so dien thoai va dia chi nhan hang.');
      return;
    }

    const request: CheckoutFromCartRequest = {
      recipientName: this.form.recipientName.trim(),
      recipientPhone: this.form.recipientPhone.trim(),
      provinceCode: this.normalizeOptional(this.form.provinceCode),
      districtCode: this.normalizeOptional(this.form.districtCode),
      wardCode: this.normalizeOptional(this.form.wardCode),
      addressLine1: this.form.addressLine1.trim(),
      addressLine2: this.normalizeOptional(this.form.addressLine2),
      shippingMethodCode: this.normalizeOptional(this.form.shippingMethodCode),
      shippingMethodName: this.normalizeOptional(this.form.shippingMethodName),
      paymentMethodCode: this.normalizeOptional(this.form.paymentMethodCode),
      paymentMethodName: this.normalizeOptional(this.form.paymentMethodName),
      customerNote: this.normalizeOptional(this.form.customerNote),
    };

    this.cartStore.checkout(request).pipe(
      finalize(() => this.loadCartAndPricing()),
    ).subscribe({
      next: (order) => {
        this.notifications.success(`Dat hang thanh cong: ${order.orderNumber}`);
        void this.router.navigateByUrl(APP_ROUTES.myOrderDetail(order.id));
      },
      error: (error) => {
        const mapped = this.errorMapper.map(error);
        this.cartStore.setCheckoutError(mapped.message);
        this.notifications.error(mapped.message);
      },
    });
  }

  protected canSubmit(): boolean {
    const currentCart = this.cart();
    if (!currentCart || !currentCart.items.length) {
      return false;
    }

    return currentCart.items.every((item) => (item.canCheckout ?? true) && item.quantity <= (item.availableQty ?? item.quantity));
  }

  protected checkoutAvailabilityLabel(): string {
    return this.canSubmit() ? 'Co the checkout' : 'Can cap nhat lai ton kho';
  }

  protected formatCurrency(value: number | null | undefined, currencyCode: string | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${value.toLocaleString('vi-VN')} ${currencyCode || 'VND'}`;
  }

  private normalizeOptional(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }
}
