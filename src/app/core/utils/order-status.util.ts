import { OrderStatus, PaymentStatus } from '../models/order.models';

const ORDER_TERMINAL_STATUSES = new Set<OrderStatus | string>([
  'COMPLETED',
  'CANCELLED',
  'DELIVERED',
  'RETURNED',
]);

const ORDER_SAGA_ACTIVE_STATUSES = new Set<OrderStatus | string>([
  'PENDING_CONFIRMATION',
  'PENDING_PAYMENT',
]);

const PAYMENT_NON_TERMINAL_STATUSES = new Set<PaymentStatus | string>([
  'CREATED',
  'AUTHORIZING',
  'AUTHORIZED',
  'CAPTURE_PENDING',
  'SETTLEMENT_PENDING',
  'PARTIALLY_PAID',
  'CHARGEBACK_OPEN',
  'PENDING',
  'UNPAID',
]);

export function isOrderStatusTerminal(status: OrderStatus | string | null | undefined): boolean {
  return !!status && ORDER_TERMINAL_STATUSES.has(status);
}

export function isOrderSagaActive(status: OrderStatus | string | null | undefined): boolean {
  return !!status && ORDER_SAGA_ACTIVE_STATUSES.has(status);
}

export function isPaymentStatusInFlight(status: PaymentStatus | string | null | undefined): boolean {
  return !!status && PAYMENT_NON_TERMINAL_STATUSES.has(status);
}
