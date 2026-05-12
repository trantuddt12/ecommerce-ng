import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import {
  CreatePaymentIntentRequest,
  PaymentAmountRequest,
  PaymentFinanceReconcileRequest,
  PaymentFinanceReconcileResult,
  PaymentIntent,
} from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly baseApi = inject(BaseApiService);

  createIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntent> {
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.intents,
        request,
        'api',
        undefined,
        this.buildMutationHeaders(),
      )
      .pipe(map((response) => this.normalizeIntent(unwrapApiEnvelope(response))));
  }

  authorize(intentId: string, request?: PaymentAmountRequest | null): Observable<PaymentIntent> {
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.authorize(intentId),
        request ?? {},
        'api',
        undefined,
        this.buildMutationHeaders(),
      )
      .pipe(map((response) => this.normalizeIntent(unwrapApiEnvelope(response))));
  }

  capture(intentId: string, request?: PaymentAmountRequest | null): Observable<PaymentIntent> {
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.capture(intentId),
        request ?? {},
        'api',
        undefined,
        this.buildMutationHeaders(),
      )
      .pipe(map((response) => this.normalizeIntent(unwrapApiEnvelope(response))));
  }

  refund(intentId: string, request?: PaymentAmountRequest | null): Observable<PaymentIntent> {
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.refund(intentId),
        request ?? {},
        'api',
        undefined,
        this.buildMutationHeaders(),
      )
      .pipe(map((response) => this.normalizeIntent(unwrapApiEnvelope(response))));
  }

  void(intentId: string): Observable<PaymentIntent> {
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.void(intentId),
        {},
        'api',
        undefined,
        this.buildMutationHeaders(),
      )
      .pipe(map((response) => this.normalizeIntent(unwrapApiEnvelope(response))));
  }

  getById(intentId: string): Observable<PaymentIntent> {
    return this.baseApi.get<PaymentIntent | ApiEnvelope<PaymentIntent>>(API_ENDPOINTS.payment.byId(intentId)).pipe(
      map((response) => this.normalizeIntent(unwrapApiEnvelope(response))),
    );
  }

  getByOrderId(orderId: number): Observable<PaymentIntent | null> {
    return this.baseApi.get<PaymentIntent | ApiEnvelope<PaymentIntent> | null>(API_ENDPOINTS.payment.byOrderId(orderId)).pipe(
      map((response) => this.normalizeIntentOrNull(unwrapApiEnvelope(response))),
    );
  }

  reconcile(request?: PaymentFinanceReconcileRequest | null): Observable<PaymentFinanceReconcileResult> {
    return this.baseApi
      .post<PaymentFinanceReconcileResult | ApiEnvelope<PaymentFinanceReconcileResult>>(
        API_ENDPOINTS.payment.reconcile,
        request ?? {},
      )
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }

  private buildMutationHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Idempotency-Key': this.randomId(),
      'X-Correlation-Id': this.randomId(),
    });
  }

  private randomId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private normalizeIntent(intent: PaymentIntent): PaymentIntent {
    return {
      ...intent,
      amount: Number(intent.amount ?? 0),
      authorizedAmount: intent.authorizedAmount === null || intent.authorizedAmount === undefined ? null : Number(intent.authorizedAmount),
      capturedAmount: intent.capturedAmount === null || intent.capturedAmount === undefined ? null : Number(intent.capturedAmount),
      refundedAmount: intent.refundedAmount === null || intent.refundedAmount === undefined ? null : Number(intent.refundedAmount),
      refundableAmount: intent.refundableAmount === null || intent.refundableAmount === undefined ? null : Number(intent.refundableAmount),
      terminal: !!intent.terminal,
    };
  }

  private normalizeIntentOrNull(intent: PaymentIntent | null): PaymentIntent | null {
    return intent ? this.normalizeIntent(intent) : null;
  }
}
