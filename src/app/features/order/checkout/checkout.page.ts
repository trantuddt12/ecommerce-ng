import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { Cart, CheckoutFromCartRequest } from '../../../core/models/order.models';
import { CartApiService } from '../../../core/services/cart-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
          <p class="order-eyebrow">Checkout</p>
          <h2>Hoan tat don hang</h2>
          <p>Flow nay map truc tiep voi <code>GET /carts/me</code>, <code>GET /carts/me/pricing-preview</code> va <code>PATCH /carts/me/checkout</code>.</p>
        </mat-card-content>
      </mat-card>

      @if (errorMessage()) {
        <div class="order-error">{{ errorMessage() }}</div>
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
                <p>Nhap du lieu nguoi nhan va dia chi giao hang.</p>
              </div>
              <button mat-stroked-button type="button" (click)="loadCartAndPricing()" [disabled]="loading()">Tai lai cart</button>
            </div>

            <div class="order-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Recipient name</mat-label>
                <input matInput [(ngModel)]="form.recipientName" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Recipient phone</mat-label>
                <input matInput [(ngModel)]="form.recipientPhone" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Province code</mat-label>
                <input matInput [(ngModel)]="form.provinceCode" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>District code</mat-label>
                <input matInput [(ngModel)]="form.districtCode" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ward code</mat-label>
                <input matInput [(ngModel)]="form.wardCode" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Address line 1</mat-label>
                <input matInput [(ngModel)]="form.addressLine1" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Address line 2</mat-label>
                <input matInput [(ngModel)]="form.addressLine2" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Shipping method code</mat-label>
                <input matInput [(ngModel)]="form.shippingMethodCode" placeholder="GHN_STANDARD" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Shipping method name</mat-label>
                <input matInput [(ngModel)]="form.shippingMethodName" placeholder="Giao hang tieu chuan" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Payment method code</mat-label>
                <input matInput [(ngModel)]="form.paymentMethodCode" placeholder="COD" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Payment method name</mat-label>
                <input matInput [(ngModel)]="form.paymentMethodName" placeholder="Thanh toan khi nhan hang" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Customer note</mat-label>
              <textarea matInput rows="3" [(ngModel)]="form.customerNote"></textarea>
            </mat-form-field>

            <div class="order-actions">
              <button mat-flat-button color="primary" type="button" (click)="checkout()" [disabled]="loading()">Dat hang</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="order-panel order-span-4">
          <mat-card-content>
            <div class="order-panel-header">
              <div>
                <h3>Cart va pricing</h3>
                <p>Tong hop theo response backend truoc khi checkout.</p>
              </div>
            </div>

            @if (cart()) {
              <div class="order-summary">
                <p><strong>Items:</strong> {{ cart()!.totalItems }}</p>
                <p><strong>Subtotal:</strong> {{ cart()!.subtotalAmount | number: '1.0-0' }} {{ cart()!.currencyCode || 'VND' }}</p>
                <p><strong>Discount:</strong> {{ pricingDiscount() | number: '1.0-0' }} {{ cart()!.currencyCode || 'VND' }}</p>
                <p><strong>Shipping:</strong> {{ pricingShippingFee() | number: '1.0-0' }} {{ cart()!.currencyCode || 'VND' }}</p>
                <p class="order-total"><strong>Grand total:</strong> {{ pricingGrandTotal() | number: '1.0-0' }} {{ cart()!.currencyCode || 'VND' }}</p>
                @if (cart()) {
                  <mat-chip class="order-chip">{{ checkoutAvailabilityLabel() }}</mat-chip>
                }
              </div>

              <div class="order-item-list">
                @for (item of cart()!.items; track item.id) {
                  <div class="order-item">
                    <div>
                      <strong>{{ item.productName }}</strong>
                      <div class="order-muted">{{ item.variantName || item.sku }}</div>
                      @if (item.lowStockMessage) {
                        <div class="order-stock-warning">{{ item.lowStockMessage }}</div>
                      } @else if (item.quantity > (item.availableQty ?? item.quantity)) {
                        <div class="order-stock-warning">So luong vuot ton kha dung.</div>
                      } @else if (item.inventoryStatus === 'OUT_OF_STOCK') {
                        <div class="order-stock-warning">San pham da het hang.</div>
                      }
                    </div>
                    <div class="order-item-right">
                      <span>x{{ item.quantity }}</span>
                      <strong>{{ item.lineSubtotal | number: '1.0-0' }}</strong>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="order-empty">Chua tai duoc gio hang.</div>
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
      display: grid;
      gap: 0.75rem;
      padding: 1.5rem;
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

    .order-summary {
      display: grid;
      gap: 0.45rem;
      padding: 0.9rem;
      border-radius: 0.9rem;
      background: rgba(240, 249, 255, 0.72);
      border: 1px solid rgba(125, 211, 252, 0.28);
    }

    .order-summary p {
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
      min-width: 5.5rem;
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
  private readonly cartApi = inject(CartApiService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly cart = signal<Cart | null>(null);
  protected readonly pricingDiscount = signal(0);
  protected readonly pricingShippingFee = signal(0);
  protected readonly pricingGrandTotal = signal(0);

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
    this.loading.set(true);
    this.errorMessage.set('');

    this.cartApi
      .getMyCart()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (cart) => {
          this.cart.set(cart);
          this.pricingDiscount.set(cart.discountAmount || 0);
          this.pricingShippingFee.set(0);
          this.pricingGrandTotal.set(cart.grandTotal || 0);
          this.loadPricingPreview();
        },
        error: (error) => this.errorMessage.set(this.errorMapper.map(error).message),
      });
  }

  private loadPricingPreview(): void {
    this.cartApi.previewPricing().subscribe({
      next: (preview) => {
        this.pricingDiscount.set(preview.discountAmount || 0);
        this.pricingShippingFee.set(preview.shippingFee || 0);
        this.pricingGrandTotal.set(preview.grandTotal || 0);
      },
      error: () => undefined,
    });
  }

  protected checkout(): void {
    if (!this.isCartCheckoutAllowed()) {
      this.notifications.error('Gio hang hien tai co san pham khong du ton de checkout.');
      return;
    }

    if (!this.form.recipientName.trim() || !this.form.recipientPhone.trim() || !this.form.addressLine1.trim()) {
      this.notifications.error('Can nhap recipient name, recipient phone va address line 1.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const request: CheckoutFromCartRequest = {
      recipientName: this.form.recipientName.trim(),
      recipientPhone: this.form.recipientPhone.trim(),
      provinceCode: this.form.provinceCode.trim(),
      districtCode: this.form.districtCode.trim(),
      wardCode: this.form.wardCode.trim(),
      addressLine1: this.form.addressLine1.trim(),
      addressLine2: this.form.addressLine2?.trim() || null,
      shippingMethodCode: this.form.shippingMethodCode.trim(),
      shippingMethodName: this.form.shippingMethodName.trim(),
      paymentMethodCode: this.form.paymentMethodCode.trim(),
      paymentMethodName: this.form.paymentMethodName.trim(),
      customerNote: this.form.customerNote?.trim() || null,
    };

    this.cartApi
      .checkout(request)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (order) => {
          this.notifications.success(`Dat hang thanh cong: ${order.orderNumber}`);
          this.router.navigateByUrl(APP_ROUTES.myOrderDetail(order.id));
        },
        error: (error) => {
          const mapped = this.errorMapper.map(error);
          this.errorMessage.set(mapped.message);
          this.notifications.error(mapped.message);
          this.loadCartAndPricing();
        },
      });
  }

  protected isCartCheckoutAllowed(): boolean {
    const cart = this.cart();
    if (!cart) {
      return false;
    }

    return cart.items.every((item) => (item.canCheckout ?? true) && item.quantity <= (item.availableQty ?? item.quantity));
  }

  protected checkoutAvailabilityLabel(): string {
    return this.isCartCheckoutAllowed() ? 'Co the checkout' : 'Can cap nhat lai ton kho';
  }
}
