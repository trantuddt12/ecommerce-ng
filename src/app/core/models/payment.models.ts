export type PaymentStatus =
  | 'CREATED'
  | 'AUTHORIZING'
  | 'AUTHORIZED'
  | 'CAPTURE_PENDING'
  | 'CAPTURED'
  | 'PARTIALLY_PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'SETTLEMENT_PENDING'
  | 'SETTLED'
  | 'CHARGEBACK_OPEN'
  | 'CHARGEBACK_WON'
  | 'CHARGEBACK_LOST'
  | 'FAILED'
  | 'VOIDED'
  | 'PENDING'
  | 'UNPAID';

export type PaymentProvider = 'VNPAY' | 'MOMO' | 'STRIPE' | 'COD' | string;

export interface PaymentIntent {
  id: string;
  orderId: number | null;
  customerId: number | null;
  amount: number;
  authorizedAmount: number | null;
  capturedAmount: number | null;
  refundedAmount: number | null;
  refundableAmount: number | null;
  currencyCode: string | null;
  status: PaymentStatus | string;
  provider: PaymentProvider | null;
  providerTxnRef: string | null;
  providerAuthCode: string | null;
  providerErrorCode: string | null;
  providerErrorMessage: string | null;
  terminal: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreatePaymentIntentRequest {
  orderId: number;
  customerId?: number | null;
  amount: number;
  currencyCode?: string | null;
  provider?: PaymentProvider | null;
}

export interface PaymentAmountRequest {
  amount?: number | null;
}

export interface MomoPaymentSimulationRequest {
  outcome: 'APPROVED' | 'DECLINED';
}

export interface MomoPaymentSimulationResponse {
  orderId: number | null;
  provider: PaymentProvider | null;
  outcome: 'APPROVED' | 'DECLINED' | string;
  message: string | null;
  intent: PaymentIntent;
}

export interface PaymentFinanceReconcileRequest {
  businessDate?: string | null;
}

export interface PaymentFinanceReconcileResult {
  businessDate: string;
  matched: number;
  mismatched: number;
  missingExternal: number;
  openIssues: number;
  healthy: boolean;
}
