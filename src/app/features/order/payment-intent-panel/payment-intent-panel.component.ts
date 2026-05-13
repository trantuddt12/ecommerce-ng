import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize, Observable } from 'rxjs';
import { PaymentApiService } from '../../../core/services/payment-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreatePaymentIntentRequest, PaymentIntent, PaymentStatus } from '../../../core/models/payment.models';

@Component({
  selector: 'app-payment-intent-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatProgressBarModule],
  template: `
    <mat-card class="payment-panel">
      <mat-card-content>
        <div class="payment-header">
          <div>
            <h3>Payment intent</h3>
            <p>Flow payment backend: create, authorize, capture, refund, void.</p>
          </div>
          @if (intent(); as currentIntent) {
            <mat-chip class="payment-chip">{{ currentIntent.status }}</mat-chip>
          }
        </div>

        @if (errorMessage()) {
          <div class="payment-error">{{ errorMessage() }}</div>
        }

        @if (loading()) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }

        <div class="payment-summary-grid">
          <div><strong>Order:</strong> {{ orderId }}</div>
          <div><strong>Amount:</strong> {{ formatMoney(orderAmount, currencyCode) }}</div>
          <div><strong>Customer:</strong> {{ customerId ?? '-' }}</div>
          <div><strong>Provider:</strong> {{ intent()?.provider || provider || '-' }}</div>
        </div>

        <div class="payment-form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Provider</mat-label>
            <input matInput [(ngModel)]="provider" [disabled]="loading() || !allowCreate()" placeholder="VNPAY" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Amount</mat-label>
            <input matInput type="number" [(ngModel)]="amountInput" [disabled]="loading()" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Refund amount</mat-label>
            <input matInput type="number" [(ngModel)]="refundInput" [disabled]="loading()" />
          </mat-form-field>
        </div>

        <div class="payment-actions">
          @if (!intent()) {
            <button mat-flat-button color="primary" type="button" (click)="createIntent()" [disabled]="loading() || !allowCreate()">Tao intent</button>
          }
          @if (intent()) {
            <button mat-flat-button color="primary" type="button" (click)="authorize()" [disabled]="loading() || !canAuthorize()">Authorize</button>
            @if (adminMode) {
              <button mat-flat-button color="primary" type="button" (click)="capture()" [disabled]="loading() || !canCapture()">Capture</button>
              <button mat-stroked-button type="button" (click)="refund()" [disabled]="loading() || !canRefund()">Refund</button>
              <button mat-stroked-button color="warn" type="button" (click)="voidPayment()" [disabled]="loading() || !canVoid()">Void</button>
            }
          }
          <button mat-stroked-button type="button" (click)="reload()" [disabled]="loading()">Reload</button>
        </div>

        @if (intent(); as currentIntent) {
          <div class="payment-details">
            <div><strong>Status:</strong> {{ currentIntent.status }}</div>
            <div><strong>Authorized:</strong> {{ formatMoney(currentIntent.authorizedAmount, currentIntent.currencyCode) }}</div>
            <div><strong>Captured:</strong> {{ formatMoney(currentIntent.capturedAmount, currentIntent.currencyCode) }}</div>
            <div><strong>Refunded:</strong> {{ formatMoney(currentIntent.refundedAmount, currentIntent.currencyCode) }}</div>
            <div><strong>Refundable:</strong> {{ formatMoney(currentIntent.refundableAmount, currentIntent.currencyCode) }}</div>
            <div><strong>Txn ref:</strong> {{ currentIntent.providerTxnRef || '-' }}</div>
            <div><strong>Auth code:</strong> {{ currentIntent.providerAuthCode || '-' }}</div>
            <div><strong>Terminal:</strong> {{ currentIntent.terminal ? 'Yes' : 'No' }}</div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .payment-panel {
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 1.1rem;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
    }

    .payment-panel .mat-mdc-card-content {
      display: grid;
      gap: 0.9rem;
      padding: 1.1rem;
    }

    .payment-header {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .payment-header h3 {
      margin: 0;
      color: #0f172a;
    }

    .payment-header p {
      margin: 0.3rem 0 0;
      color: #64748b;
    }

    .payment-chip {
      background: rgba(219, 234, 254, 0.84) !important;
      color: #1d4ed8 !important;
    }

    .payment-summary-grid,
    .payment-details {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.55rem;
      color: #0f172a;
    }

    .payment-form-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .payment-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .payment-error {
      padding: 0.8rem 0.95rem;
      border-radius: 0.85rem;
      color: #b91c1c;
      background: rgba(254, 226, 226, 0.7);
      border: 1px solid rgba(248, 113, 113, 0.28);
    }

    @media (max-width: 760px) {
      .payment-summary-grid,
      .payment-details,
      .payment-form-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class PaymentIntentPanelComponent implements OnInit, OnChanges {
  @Input({ required: true }) orderId!: number;
  @Input() customerId: number | null = null;
  @Input() orderAmount = 0;
  @Input() currencyCode: string | null = null;
  @Input() canCreate = false;
  @Input() adminMode = false;
  @Output() intentChanged = new EventEmitter<PaymentIntent>();

  private readonly paymentApi = inject(PaymentApiService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly notifications = inject(NotificationService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly intent = signal<PaymentIntent | null>(null);
  protected provider = 'VNPAY';
  protected amountInput = 0;
  protected refundInput = 0;

  ngOnInit(): void {
    this.amountInput = this.orderAmount;
    this.refundInput = this.orderAmount;
    this.reload();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderAmount'] && !changes['orderAmount'].firstChange) {
      this.amountInput = this.orderAmount;
      this.refundInput = this.orderAmount;
    }

    if ((changes['orderId'] && !changes['orderId'].firstChange) || (changes['currencyCode'] && !changes['currencyCode'].firstChange)) {
      this.reload();
    }
  }

  protected reload(): void {
    if (!this.orderId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.paymentApi.getByOrderId(this.orderId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (intent: PaymentIntent | null) => {
          if (!intent) {
            this.intent.set(null);
            return;
          }
          this.intent.set(intent);
          this.provider = intent.provider || this.provider;
          this.amountInput = intent.amount;
          this.refundInput = intent.refundableAmount ?? intent.amount;
        },
        error: (error) => {
          const mapped = this.errorMapper.map(error);
          if (mapped.statusCode === 404) {
            this.intent.set(null);
            return;
          }
          this.errorMessage.set(mapped.message);
        },
      });
  }

  protected createIntent(): void {
    if (!this.allowCreate()) {
      return;
    }

    const request: CreatePaymentIntentRequest = {
      orderId: this.orderId,
      customerId: this.customerId,
      amount: this.orderAmount,
      currencyCode: this.currencyCode,
      provider: this.provider || null,
    };

    this.runAction('Da tao payment intent.', () => this.paymentApi.createIntent(request));
  }

  protected authorize(): void {
    const current = this.intent();
    if (!current) {
      return;
    }

    this.runAction('Da authorize payment.', () => this.paymentApi.authorize(current.id, { amount: this.amountInput || null }));
  }

  protected capture(): void {
    const current = this.intent();
    if (!current) {
      return;
    }

    this.runAction('Da capture payment.', () => this.paymentApi.capture(current.id, { amount: this.amountInput || null }));
  }

  protected refund(): void {
    const current = this.intent();
    if (!current) {
      return;
    }

    this.runAction('Da refund payment.', () => this.paymentApi.refund(current.id, { amount: this.refundInput || null }));
  }

  protected voidPayment(): void {
    const current = this.intent();
    if (!current) {
      return;
    }

    this.runAction('Da void payment.', () => this.paymentApi.void(current.id));
  }

  protected allowCreate(): boolean {
    return this.canCreate || this.adminMode;
  }

  protected canCapture(): boolean {
    return this.adminMode && !!this.intent() && ['AUTHORIZED', 'PARTIALLY_PAID'].includes(this.intent()!.status as PaymentStatus);
  }

  protected canRefund(): boolean {
    return this.adminMode && !!this.intent() && ['PARTIALLY_PAID', 'CAPTURED', 'PARTIALLY_REFUNDED', 'SETTLED'].includes(this.intent()!.status as PaymentStatus);
  }

  protected canVoid(): boolean {
    return this.adminMode && !!this.intent() && ['CREATED', 'AUTHORIZED'].includes(this.intent()!.status as PaymentStatus);
  }

  protected canAuthorize(): boolean {
    return !!this.intent() && this.intent()!.status === 'CREATED';
  }

  protected formatMoney(value: number | null | undefined, currencyCode: string | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${Number(value).toLocaleString('vi-VN')} ${currencyCode || 'VND'}`;
  }

  private runAction(successMessage: string, action: () => Observable<PaymentIntent>): void {
    this.loading.set(true);
    this.errorMessage.set('');

    action()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (intent: PaymentIntent) => {
          this.intent.set(intent);
          this.provider = intent.provider || this.provider;
          this.amountInput = intent.amount;
          this.refundInput = intent.refundableAmount ?? intent.amount;
          this.intentChanged.emit(intent);
          this.notifications.success(successMessage);
        },
        error: (error) => {
          const mapped = this.errorMapper.map(error);
          this.errorMessage.set(mapped.message);
          this.notifications.error(mapped.message);
        },
      });
  }
}
