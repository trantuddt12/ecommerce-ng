import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { OrderDetail } from '../../../core/models/order.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderApiService } from '../../../core/services/order-api.service';

@Component({
  selector: 'app-my-order-detail-page',
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
          <p class="order-eyebrow">Order Detail</p>
          <h2>{{ order()?.orderNumber || 'Chi tiet don hang' }}</h2>
          <p>Theo doi timeline status, item snapshot va inventory state tu response <code>GET /orders/me/:id</code>.</p>
        </mat-card-content>
      </mat-card>

      @if (errorMessage()) {
        <div class="order-error">{{ errorMessage() }}</div>
      }

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (order()) {
        <section class="order-grid">
          <mat-card class="order-panel order-span-8">
            <mat-card-content>
              <div class="order-panel-header">
                <div>
                  <h3>Trang thai don</h3>
                  <p>Order, payment va fulfillment status theo contract tach rieng.</p>
                </div>
                <a mat-stroked-button [routerLink]="APP_ROUTES.myOrders">Ve danh sach</a>
              </div>

              <div class="order-chip-row">
                <mat-chip class="order-chip">{{ order()!.orderStatus }}</mat-chip>
                <mat-chip class="order-chip order-chip-soft">{{ order()!.paymentStatus }}</mat-chip>
                <mat-chip class="order-chip order-chip-neutral">{{ order()!.fulfillmentStatus }}</mat-chip>
              </div>

              <div class="order-summary-grid">
                <div><strong>Nguoi nhan:</strong> {{ order()!.recipientName || '-' }}</div>
                <div><strong>So dien thoai:</strong> {{ order()!.recipientPhone || '-' }}</div>
                <div><strong>Dia chi:</strong> {{ fullAddress() }}</div>
                <div><strong>Thanh toan:</strong> {{ order()!.paymentMethodName || order()!.paymentMethodCode || '-' }}</div>
                <div><strong>Van chuyen:</strong> {{ order()!.shippingMethodName || order()!.shippingMethodCode || '-' }}</div>
                <div><strong>Tracking:</strong> {{ order()!.trackingNumber || '-' }}</div>
              </div>

              @if (order()!.customerNote) {
                <div class="order-note"><strong>Ghi chu khach:</strong> {{ order()!.customerNote }}</div>
              }

              <div class="order-item-list">
                @for (item of order()!.items; track item.id) {
                  <div class="order-item">
                    <div>
                      <strong>{{ item.productName }}</strong>
                      <div class="order-muted">{{ item.variantName || item.sku }}</div>
                      @if (item.variantAttributes) {
                        <div class="order-muted">{{ item.variantAttributes }}</div>
                      }
                    </div>
                    <div class="order-item-right">
                      <span>x{{ item.quantity }}</span>
                      <strong>{{ item.lineSubtotal | number: '1.0-0' }}</strong>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="order-panel order-span-4">
            <mat-card-content>
              <div class="order-panel-header">
                <div>
                  <h3>Timeline & inventory</h3>
                  <p>Lich su status va moc xu ly ton kho.</p>
                </div>
              </div>

              <div class="order-timeline">
                @for (history of order()!.histories; track history.id) {
                  <div class="order-timeline-item">
                    <strong>{{ history.orderStatus }}</strong>
                    <div class="order-muted">{{ history.changedAt | date: 'dd/MM/yyyy HH:mm' }}</div>
                    <div class="order-muted">{{ history.note || '-' }}</div>
                  </div>
                }
              </div>

              <div class="order-summary">
                <p><strong>Inventory reserved:</strong> {{ order()!.inventoryReservedAt ? 'Yes' : 'No' }}</p>
                <p><strong>Reserved at:</strong> {{ order()!.inventoryReservedAt ? (order()!.inventoryReservedAt | date: 'dd/MM/yyyy HH:mm') : '-' }}</p>
                <p><strong>Deducted at:</strong> {{ order()!.inventoryDeductedAt ? (order()!.inventoryDeductedAt | date: 'dd/MM/yyyy HH:mm') : '-' }}</p>
                <p><strong>Total:</strong> {{ order()!.grandTotal | number: '1.0-0' }} {{ order()!.currencyCode || 'VND' }}</p>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Cancel reason</mat-label>
                <textarea matInput rows="3" [(ngModel)]="cancelReason" [disabled]="!canCancel()"></textarea>
              </mat-form-field>

              <div class="order-actions">
                <button mat-flat-button color="warn" type="button" (click)="cancelOrder()" [disabled]="loading() || !canCancel()">Huy don</button>
              </div>
            </mat-card-content>
          </mat-card>
        </section>
      }
    </section>
  `,
  styles: [`
    .order-page { display: grid; gap: 1.25rem; animation: order-fade-in 360ms ease; }

    .order-hero {
      color: #fff;
      background:
        radial-gradient(circle at 80% 18%, rgba(45, 212, 191, 0.28), transparent 40%),
        linear-gradient(135deg, rgba(2, 6, 23, 0.96) 0%, rgba(30, 64, 175, 0.9) 58%, rgba(20, 83, 45, 0.86) 100%);
      border-radius: 1.2rem;
    }

    .order-hero .mat-mdc-card-content { display: grid; gap: 0.7rem; padding: 1.4rem; }
    .order-eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.74rem; color: rgba(187, 247, 208, 0.95); }
    .order-hero h2 { margin: 0; font-size: clamp(1.5rem, 2.7vw, 2.1rem); }
    .order-hero p { margin: 0; color: rgba(220, 252, 231, 0.9); }

    .order-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 1.25rem; }
    .order-span-8 { grid-column: span 8; }
    .order-span-4 { grid-column: span 4; }

    .order-panel {
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 1.1rem;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
      animation: order-fade-up 430ms ease;
    }

    .order-panel .mat-mdc-card-content { display: grid; gap: 1rem; padding: 1.1rem; }
    .order-panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; }
    .order-panel-header h3 { margin: 0; color: #0f172a; }
    .order-panel-header p { margin: 0.3rem 0 0; color: #64748b; }

    .order-chip-row { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .order-chip { background: rgba(219, 234, 254, 0.84) !important; color: #1d4ed8 !important; }
    .order-chip-soft { background: rgba(191, 219, 254, 0.85) !important; color: #1e3a8a !important; }
    .order-chip-neutral { background: rgba(226, 232, 240, 0.95) !important; color: #334155 !important; }

    .order-summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem; color: #0f172a; }
    .order-note { padding: 0.75rem 0.85rem; border-radius: 0.85rem; background: rgba(240, 249, 255, 0.72); border: 1px solid rgba(125, 211, 252, 0.3); }

    .order-item-list { display: grid; gap: 0.6rem; }
    .order-item {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 0.8rem;
      border: 1px solid rgba(148, 163, 184, 0.15);
      background: rgba(255, 255, 255, 0.9);
    }

    .order-item-right { display: grid; justify-items: end; gap: 0.2rem; min-width: 5.5rem; }
    .order-muted { color: #64748b; font-size: 0.84rem; }

    .order-timeline { display: grid; gap: 0.55rem; }
    .order-timeline-item {
      padding: 0.72rem 0.8rem;
      border-radius: 0.8rem;
      border: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(241, 245, 249, 0.68);
    }

    .order-summary {
      display: grid;
      gap: 0.4rem;
      padding: 0.82rem;
      border-radius: 0.85rem;
      border: 1px solid rgba(148, 163, 184, 0.15);
      background: rgba(255, 255, 255, 0.88);
    }

    .order-summary p { margin: 0; }
    .order-actions { display: flex; gap: 0.7rem; }

    .order-error {
      padding: 0.82rem 1rem;
      border-radius: 0.9rem;
      color: #b91c1c;
      background: rgba(254, 226, 226, 0.7);
      border: 1px solid rgba(248, 113, 113, 0.28);
    }

    @keyframes order-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes order-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1100px) {
      .order-span-8,
      .order-span-4 { grid-column: span 12; }
    }

    @media (max-width: 760px) {
      .order-summary-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class MyOrderDetailPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  private readonly route = inject(ActivatedRoute);
  private readonly orderApi = inject(OrderApiService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly notifications = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly order = signal<OrderDetail | null>(null);
  protected cancelReason = '';

  protected readonly canCancel = computed(() => {
    const status = this.order()?.orderStatus;
    return status === 'PENDING_CONFIRMATION' || status === 'CONFIRMED';
  });

  protected readonly fullAddress = computed(() => {
    const value = this.order();
    if (!value) {
      return '-';
    }

    return [value.addressLine1, value.addressLine2, value.wardCode, value.districtCode, value.provinceCode]
      .filter((part) => !!part)
      .join(', ');
  });

  constructor() {
    this.loadOrder();
  }

  private loadOrder(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Order id khong hop le.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.orderApi
      .getMyOrderById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.cancelReason = order.cancelReason || '';
        },
        error: (error) => this.errorMessage.set(this.errorMapper.map(error).message),
      });
  }

  protected cancelOrder(): void {
    const current = this.order();
    if (!current || !this.canCancel()) {
      return;
    }

    if (!this.cancelReason.trim()) {
      this.notifications.error('Can nhap ly do huy don.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.orderApi
      .cancelMyOrder(current.id, { cancelReason: this.cancelReason.trim() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updated) => {
          this.order.set(updated);
          this.notifications.success('Da huy don thanh cong.');
        },
        error: (error) => {
          const mapped = this.errorMapper.map(error);
          this.errorMessage.set(mapped.message);
          this.notifications.error(mapped.message);
        },
      });
  }
}
