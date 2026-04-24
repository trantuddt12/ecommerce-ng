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
  styles: [`
    .order-page {
      display: grid;
      gap: 1.25rem;
      animation: order-fade-in 360ms ease;
    }

    .order-hero {
      color: #fff;
      background:
        radial-gradient(circle at 80% 10%, rgba(56, 189, 248, 0.32), transparent 38%),
        linear-gradient(135deg, rgba(2, 6, 23, 0.96) 0%, rgba(12, 74, 110, 0.92) 55%, rgba(14, 116, 144, 0.9) 100%);
      overflow: hidden;
      border-radius: 1.25rem;
    }

    .order-hero .mat-mdc-card-content {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 1.5rem;
      flex-wrap: wrap;
    }

    .order-eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.74rem;
      color: rgba(186, 230, 253, 0.95);
    }

    .order-hero h2 {
      margin: 0;
      font-size: clamp(1.55rem, 2.8vw, 2.15rem);
    }

    .order-hero p {
      margin: 0;
      color: rgba(224, 242, 254, 0.92);
    }

    .order-hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .order-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 1.25rem;
    }

    .order-span-8 {
      grid-column: span 8;
    }

    .order-span-4 {
      grid-column: span 4;
    }

    .order-panel {
      border-radius: 1.15rem;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
      animation: order-fade-up 420ms ease;
    }

    .order-panel .mat-mdc-card-content {
      display: grid;
      gap: 1rem;
      padding: 1.15rem;
    }

    .order-panel-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .order-panel-header h3 {
      margin: 0;
      color: #0f172a;
    }

    .order-panel-header p {
      margin: 0.3rem 0 0;
      color: #64748b;
    }

    .order-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.9rem;
    }

    .order-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .order-summary,
    .order-voucher-box {
      display: grid;
      gap: 0.45rem;
      padding: 0.9rem;
      border-radius: 0.9rem;
      background: rgba(240, 249, 255, 0.72);
      border: 1px solid rgba(125, 211, 252, 0.28);
    }

    .order-summary p,
    .order-voucher-box span {
      margin: 0;
      color: #0f172a;
    }

    .order-total {
      margin-top: 0.2rem;
      padding-top: 0.55rem;
      border-top: 1px dashed rgba(14, 116, 144, 0.28);
    }

    .order-chip {
      width: fit-content;
      background: rgba(186, 230, 253, 0.85) !important;
      color: #0c4a6e !important;
    }

    .order-item-list {
      display: grid;
      gap: 0.6rem;
      max-height: 22rem;
      overflow: auto;
      padding-right: 0.2rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.8rem;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(255, 255, 255, 0.9);
    }

    .order-item-right {
      display: grid;
      justify-items: end;
      gap: 0.15rem;
      min-width: 7rem;
    }

    .order-muted {
      color: #64748b;
      font-size: 0.86rem;
    }

    .order-empty {
      color: #64748b;
    }

    .order-error {
      padding: 0.82rem 1rem;
      border-radius: 0.9rem;
      color: #b91c1c;
      background: rgba(254, 226, 226, 0.65);
      border: 1px solid rgba(248, 113, 113, 0.28);
    }

    .order-stock-warning {
      color: #b45309;
      font-size: 0.82rem;
    }

    @keyframes order-fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes order-fade-up {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1100px) {
      .order-span-8,
      .order-span-4 {
        grid-column: span 12;
      }
    }

    @media (max-width: 760px) {
      .order-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
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
