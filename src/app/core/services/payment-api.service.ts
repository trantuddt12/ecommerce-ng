import { HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import {
  CreatePaymentIntentRequest,
  MomoPaymentSimulationRequest,
  MomoPaymentSimulationResponse,
  PaymentAmountRequest,
  PaymentFinanceReconcileRequest,
  PaymentFinanceReconcileResult,
  PaymentIntent,
} from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly baseApi = inject(BaseApiService);

  createIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntent> {
    const opKey = `createIntent:${request.orderId}`;
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.intents,
        request,
        'api',
        undefined,
        this.buildMutationHeaders(opKey),
      )
      .pipe(
        map((response) => this.normalizeIntent(unwrapApiEnvelope(response))),
        tap(() => this.releaseIdempotencyKey(opKey)),
      );
  }

  authorize(intentId: string, request?: PaymentAmountRequest | null): Observable<PaymentIntent> {
    const opKey = `authorize:${intentId}`;
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.authorize(intentId),
        request ?? {},
        'api',
        undefined,
        this.buildMutationHeaders(opKey),
      )
      .pipe(
        map((response) => this.normalizeIntent(unwrapApiEnvelope(response))),
        tap(() => this.releaseIdempotencyKey(opKey)),
      );
  }

  capture(intentId: string, request?: PaymentAmountRequest | null): Observable<PaymentIntent> {
    const opKey = `capture:${intentId}`;
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.capture(intentId),
        request ?? {},
        'api',
        undefined,
        this.buildMutationHeaders(opKey),
      )
      .pipe(
        map((response) => this.normalizeIntent(unwrapApiEnvelope(response))),
        tap(() => this.releaseIdempotencyKey(opKey)),
      );
  }

  refund(intentId: string, request?: PaymentAmountRequest | null): Observable<PaymentIntent> {
    const opKey = `refund:${intentId}`;
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.refund(intentId),
        request ?? {},
        'api',
        undefined,
        this.buildMutationHeaders(opKey),
      )
      .pipe(
        map((response) => this.normalizeIntent(unwrapApiEnvelope(response))),
        tap(() => this.releaseIdempotencyKey(opKey)),
      );
  }

  void(intentId: string): Observable<PaymentIntent> {
    const opKey = `void:${intentId}`;
    return this.baseApi
      .post<PaymentIntent | ApiEnvelope<PaymentIntent>>(
        API_ENDPOINTS.payment.void(intentId),
        {},
        'api',
        undefined,
        this.buildMutationHeaders(opKey),
      )
      .pipe(
        map((response) => this.normalizeIntent(unwrapApiEnvelope(response))),
        tap(() => this.releaseIdempotencyKey(opKey)),
      );
  }

  simulateMomo(intentId: string, request: MomoPaymentSimulationRequest): Observable<MomoPaymentSimulationResponse> {
    const opKey = `simulateMomo:${intentId}`;
    return this.baseApi
      .post<MomoPaymentSimulationResponse | ApiEnvelope<MomoPaymentSimulationResponse>>(
        API_ENDPOINTS.payment.simulateMomo(intentId),
        request,
        'api',
        undefined,
        this.buildMutationHeaders(opKey),
      )
      .pipe(
        map((response) => this.normalizeMomoResponse(unwrapApiEnvelope(response))),
        tap(() => this.releaseIdempotencyKey(opKey)),
      );
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

  /**
   * Idempotency keys keyed by logical operation (e.g. "authorize:<intentId>").
   * A key is generated once per operation and reused across retries / duplicate
   * submissions (double-click, network retry) so the backend can dedupe the
   * request instead of charging twice. The key is released only on success, so
   * a deliberate follow-up operation (e.g. a second partial refund) gets a fresh
   * key while a failed/timed-out attempt keeps the same key for safe retry.
   */
  private readonly idempotencyKeys = new Map<string, string>();

  private buildMutationHeaders(operationKey: string): HttpHeaders {
    return new HttpHeaders({
      'Idempotency-Key': this.resolveIdempotencyKey(operationKey),
      'X-Correlation-Id': this.randomId(),
    });
  }

  private resolveIdempotencyKey(operationKey: string): string {
    let key = this.idempotencyKeys.get(operationKey);
    if (!key) {
      key = this.randomId();
      this.idempotencyKeys.set(operationKey, key);
    }
    return key;
  }

  private releaseIdempotencyKey(operationKey: string): void {
    this.idempotencyKeys.delete(operationKey);
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
      paid: !!intent.paid,
    };
  }

  private normalizeIntentOrNull(intent: PaymentIntent | null): PaymentIntent | null {
    return intent ? this.normalizeIntent(intent) : null;
  }

  private normalizeMomoResponse(response: MomoPaymentSimulationResponse): MomoPaymentSimulationResponse {
    return {
      ...response,
      intent: this.normalizeIntent(response.intent),
    };
  }
}
