import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription, finalize } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { OrderDetail } from '../../../core/models/order.models';
import { PaymentIntent } from '../../../core/models/payment.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderApiService } from '../../../core/services/order-api.service';
import { PaymentApiService } from '../../../core/services/payment-api.service';
import { pollUntil } from '../../../core/utils/polling.util';

@Component({
  selector: 'app-momo-payment-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  template: `
    <section class="momo-page">
      <mat-card class="momo-hero">
        <mat-card-content>
          <div>
            <p class="momo-eyebrow">MoMo Sandbox</p>
            <h2>{{ order()?.orderNumber || 'Thanh toan MoMo' }}</h2>
            <p>{{ formatMoney(order()?.grandTotal, order()?.currencyCode) }}</p>
          </div>
          <a mat-stroked-button [routerLink]="order() ? APP_ROUTES.myOrderDetail(order()!.id) : APP_ROUTES.myOrders">Ve don hang</a>
        </mat-card-content>
      </mat-card>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (errorMessage()) {
        <div class="momo-error">{{ errorMessage() }}</div>
      }

      @if (order(); as currentOrder) {
        <section class="momo-grid">
          <mat-card class="momo-wallet">
            <mat-card-content>
              <div class="momo-brand">
                <div class="momo-logo">M</div>
                <div>
                  <h3>MoMo</h3>
                  <p>{{ paymentStateLabel() }}</p>
                </div>
              </div>

              <div class="momo-qr" aria-hidden="true">
                <span></span><span></span><span></span><span></span>
              </div>

              <div class="momo-amount">
                <span>So tien</span>
                <strong>{{ formatMoney(currentOrder.grandTotal, currentOrder.currencyCode) }}</strong>
              </div>

              <div class="momo-actions">
                <button mat-flat-button color="primary" type="button" (click)="approve()" [disabled]="!canPay() || submitting()">
                  Thanh toan thanh cong
                </button>
                <button mat-stroked-button color="warn" type="button" (click)="decline()" [disabled]="!canPay() || submitting()">
                  Mo phong that bai
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="momo-summary">
            <mat-card-content>
              <div class="momo-summary-header">
                <h3>Don hang</h3>
                <mat-chip>{{ currentOrder.paymentStatus }}</mat-chip>
                @if (polling()) {
                  <mat-chip class="momo-chip-live">Dang cap nhat...</mat-chip>
                } @else if (pollingTimedOut()) {
                  <mat-chip class="momo-chip-warn">
                    Het thoi gian cho. <button mat-button type="button" (click)="loadPayment()">Tai lai</button>
                  </mat-chip>
                }
              </div>

              <div class="momo-summary-list">
                <div><span>Nguoi nhan</span><strong>{{ currentOrder.recipientName || '-' }}</strong></div>
                <div><span>So dien thoai</span><strong>{{ currentOrder.recipientPhone || '-' }}</strong></div>
                <div><span>Dia chi</span><strong>{{ currentOrder.addressLine1 || '-' }}</strong></div>
                <div><span>Phuong thuc</span><strong>{{ currentOrder.paymentMethodName || currentOrder.paymentMethodCode || '-' }}</strong></div>
                <div><span>Intent</span><strong>{{ intent()?.status || '-' }}</strong></div>
                <div><span>Ma giao dich</span><strong>{{ intent()?.providerTxnRef || '-' }}</strong></div>
              </div>
            </mat-card-content>
          </mat-card>
        </section>
      }
    </section>
  `,
  styles: [`
    .momo-page {
      display: grid;
      gap: 1.25rem;
    }

    .momo-hero {
      color: #fff;
      border-radius: 1.1rem;
      background:
        radial-gradient(circle at 84% 18%, rgba(244, 114, 182, 0.3), transparent 38%),
        linear-gradient(135deg, #831843 0%, #be185d 48%, #334155 100%);
    }

    .momo-hero .mat-mdc-card-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.35rem;
    }

    .momo-eyebrow,
    .momo-hero h2,
    .momo-hero p,
    .momo-brand h3,
    .momo-brand p,
    .momo-summary-header h3 {
      margin: 0;
    }

    .momo-eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.74rem;
      color: rgba(252, 231, 243, 0.94);
    }

    .momo-hero h2 {
      margin-top: 0.25rem;
      font-size: 1.7rem;
    }

    .momo-hero p {
      margin-top: 0.25rem;
      color: rgba(252, 231, 243, 0.94);
    }

    .momo-grid {
      display: grid;
      grid-template-columns: minmax(18rem, 0.9fr) minmax(18rem, 1.1fr);
      gap: 1.25rem;
      align-items: start;
    }

    .momo-wallet,
    .momo-summary {
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 1rem;
      background: #fff;
    }

    .momo-wallet .mat-mdc-card-content,
    .momo-summary .mat-mdc-card-content {
      display: grid;
      gap: 1rem;
      padding: 1.15rem;
    }

    .momo-brand,
    .momo-summary-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
    }

    .momo-brand {
      justify-content: flex-start;
    }

    .momo-logo {
      display: grid;
      width: 3rem;
      height: 3rem;
      place-items: center;
      border-radius: 0.8rem;
      background: #be185d;
      color: #fff;
      font-weight: 800;
      font-size: 1.35rem;
    }

    .momo-brand p,
    .momo-summary-list span {
      color: #64748b;
      font-size: 0.88rem;
    }

    .momo-qr {
      position: relative;
      aspect-ratio: 1;
      min-height: 14rem;
      border-radius: 0.9rem;
      border: 1px solid rgba(148, 163, 184, 0.24);
      background:
        linear-gradient(90deg, rgba(15, 23, 42, 0.9) 12%, transparent 12% 24%, rgba(190, 24, 93, 0.9) 24% 36%, transparent 36% 52%, rgba(15, 23, 42, 0.9) 52% 64%, transparent 64%),
        linear-gradient(0deg, transparent 10%, rgba(15, 23, 42, 0.12) 10% 18%, transparent 18% 32%, rgba(190, 24, 93, 0.16) 32% 42%, transparent 42%),
        #f8fafc;
      background-size: 4rem 4rem, 3.25rem 3.25rem, auto;
      overflow: hidden;
    }

    .momo-qr span {
      position: absolute;
      width: 3.2rem;
      height: 3.2rem;
      border: 0.55rem solid #0f172a;
      background: #fff;
    }

    .momo-qr span:nth-child(1) { top: 1rem; left: 1rem; }
    .momo-qr span:nth-child(2) { top: 1rem; right: 1rem; }
    .momo-qr span:nth-child(3) { bottom: 1rem; left: 1rem; }
    .momo-qr span:nth-child(4) {
      right: 1.2rem;
      bottom: 1.2rem;
      width: 2rem;
      height: 2rem;
      border-color: #be185d;
    }

    .momo-amount,
    .momo-summary-list {
      display: grid;
      gap: 0.65rem;
    }

    .momo-amount span {
      color: #64748b;
    }

    .momo-amount strong {
      color: #0f172a;
      font-size: 1.55rem;
    }

    .momo-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .momo-summary-list div {
      display: grid;
      gap: 0.2rem;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
    }

    .momo-summary-list strong {
      color: #0f172a;
      overflow-wrap: anywhere;
    }

    .momo-error {
      padding: 0.85rem 1rem;
      border-radius: 0.9rem;
      border: 1px solid rgba(248, 113, 113, 0.28);
      background: rgba(254, 226, 226, 0.72);
      color: #991b1b;
    }

    .momo-chip-live { background: rgba(187, 247, 208, 0.85) !important; color: #166534 !important; animation: momo-chip-pulse 1.4s ease-in-out infinite; }
    .momo-chip-warn { background: rgba(254, 215, 170, 0.9) !important; color: #9a3412 !important; }
    .momo-chip-warn button { margin-left: 0.4rem; padding: 0 0.5rem; min-width: auto; line-height: 1.4; }

    @keyframes momo-chip-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }

    @media (max-width: 860px) {
      .momo-grid {
        grid-template-columns: 1fr;
      }

      .momo-hero .mat-mdc-card-content {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `],
})
export class MomoPaymentPage implements OnInit {
  protected readonly APP_ROUTES = APP_ROUTES;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderApi = inject(OrderApiService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly order = signal<OrderDetail | null>(null);
  protected readonly intent = signal<PaymentIntent | null>(null);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly polling = signal(false);
  protected readonly pollingTimedOut = signal(false);

  private pollingSub: Subscription | null = null;
  protected readonly canPay = computed(() => {
    const currentIntent = this.intent();
    const currentOrder = this.order();
    return !!currentOrder
      && currentOrder.paymentMethodCode?.toUpperCase() === 'MOMO'
      && currentOrder.canPay
      && (!currentIntent || ['CREATED', 'FAILED'].includes(currentIntent.status));
  });

  ngOnInit(): void {
    this.loadPayment();
  }

  protected loadPayment(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!Number.isFinite(orderId) || orderId <= 0) {
      this.errorMessage.set('Khong tim thay don hang can thanh toan.');
      return;
    }

    this.stopPolling();
    this.pollingTimedOut.set(false);
    this.loading.set(true);
    this.errorMessage.set('');
    this.orderApi.getMyOrderById(orderId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (order) => {
          this.order.set(order);
          this.loadOrCreateIntent(order);
        },
        error: (error) => this.showError(error),
      });
  }

  protected approve(): void {
    const currentIntent = this.intent();
    if (!currentIntent) {
      this.errorMessage.set('Chua co payment intent cho don hang.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.paymentApi.simulateMomo(currentIntent.id, { outcome: 'APPROVED' })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          this.intent.set(response.intent);
          this.notifications.success('Da gui xac nhan MoMo. Dang cho he thong cap nhat...');
          this.startIntentPolling(response.intent.id, true);
        },
        error: (error) => this.showError(error),
      });
  }

  protected decline(): void {
    const currentIntent = this.intent();
    if (!currentIntent) {
      this.errorMessage.set('Chua co payment intent cho don hang.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    this.paymentApi.simulateMomo(currentIntent.id, { outcome: 'DECLINED' })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (response) => {
          this.intent.set(response.intent);
          this.notifications.error('MoMo da tu choi giao dich gia lap.');
          this.startIntentPolling(response.intent.id, false);
        },
        error: (error) => this.showError(error),
      });
  }

  private startIntentPolling(intentId: string, redirectOnTerminal: boolean): void {
    this.stopPolling();
    this.pollingTimedOut.set(false);

    if (this.intent()?.terminal) {
      this.handleTerminalIntent(redirectOnTerminal);
      return;
    }

    this.polling.set(true);

    this.pollingSub = pollUntil(() => this.paymentApi.getById(intentId), {
      intervalMs: 3000,
      timeoutMs: 90000,
      shouldStop: (intent) => intent.terminal,
      onError: () => 'continue',
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.intent.set(result.value);
          if (result.stopped) {
            this.polling.set(false);
            this.handleTerminalIntent(redirectOnTerminal);
          } else if (result.timedOut) {
            this.polling.set(false);
            this.pollingTimedOut.set(true);
            this.notifications.error('Het thoi gian cho cap nhat thanh toan. Vui long tai lai.');
          }
        },
        error: () => {
          this.polling.set(false);
        },
      });
  }

  private handleTerminalIntent(redirectOnTerminal: boolean): void {
    const currentIntent = this.intent();
    if (!currentIntent) return;
    if (currentIntent.status === 'CAPTURED' || currentIntent.status === 'SETTLED') {
      this.notifications.success('Thanh toan thanh cong.');
      if (redirectOnTerminal) {
        const orderId = currentIntent.orderId ?? this.order()?.id;
        if (orderId) {
          void this.router.navigateByUrl(APP_ROUTES.myOrderDetail(orderId));
        }
      }
    }
  }

  private stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = null;
    this.polling.set(false);
  }

  protected formatMoney(value: number | null | undefined, currencyCode: string | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${Number(value).toLocaleString('vi-VN')} ${currencyCode || 'VND'}`;
  }

  protected paymentStateLabel(): string {
    const status = this.intent()?.status;
    if (status === 'CAPTURED' || status === 'SETTLED') {
      return 'Da thanh toan';
    }
    if (status === 'FAILED') {
      return 'Giao dich that bai';
    }
    return 'Cho xac nhan';
  }

  private loadOrCreateIntent(order: OrderDetail): void {
    this.paymentApi.getByOrderId(order.id).subscribe({
      next: (intent) => {
        if (intent) {
          this.intent.set(intent);
          if (!intent.terminal && intent.status !== 'CREATED') {
            this.startIntentPolling(intent.id, false);
          }
          return;
        }
        if (order.paymentMethodCode?.toUpperCase() !== 'MOMO' || !order.canPay) {
          this.intent.set(null);
          return;
        }
        this.createMomoIntent(order);
      },
      error: (error) => this.showError(error),
    });
  }

  private createMomoIntent(order: OrderDetail): void {
    this.paymentApi.createIntent({
      orderId: order.id,
      customerId: order.customerId,
      amount: order.grandTotal,
      currencyCode: order.currencyCode,
      provider: 'MOMO',
    }).subscribe({
      next: (intent) => this.intent.set(intent),
      error: (error) => this.showError(error),
    });
  }

  private showError(error: unknown): void {
    const mapped = this.errorMapper.map(error);
    this.errorMessage.set(mapped.message);
    this.notifications.error(mapped.message);
  }
}
