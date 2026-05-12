export function toOrderStatusLabel(status: string | null | undefined): string {
  return ORDER_STATUS_LABELS[status ?? ''] ?? status ?? '-';
}

export function toPaymentStatusLabel(status: string | null | undefined): string {
  return PAYMENT_STATUS_LABELS[status ?? ''] ?? status ?? '-';
}

export function toFulfillmentStatusLabel(status: string | null | undefined): string {
  return FULFILLMENT_STATUS_LABELS[status ?? ''] ?? status ?? '-';
}

export function formatOrderMoney(value: number | null | undefined, currencyCode: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }

  return `${value.toLocaleString('vi-VN')} ${currencyCode || 'VND'}`;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRMATION: 'Cho xac nhan',
  PENDING_PAYMENT: 'Cho thanh toan',
  CONFIRMED: 'Da xac nhan',
  PACKING: 'Dang dong goi',
  READY_TO_SHIP: 'San sang giao',
  SHIPPING: 'Dang giao',
  DELIVERED: 'Da giao',
  COMPLETED: 'Hoan tat',
  CANCELLED: 'Da huy',
  DELIVERY_FAILED: 'Giao that bai',
  RETURN_REQUESTED: 'Yeu cau tra hang',
  RETURNED: 'Da tra hang',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Da tao yeu cau',
  AUTHORIZING: 'Dang uy quyen',
  AUTHORIZED: 'Da uy quyen',
  CAPTURE_PENDING: 'Cho capture',
  CAPTURED: 'Da capture',
  PARTIALLY_PAID: 'Thanh toan mot phan',
  PAID: 'Da thanh toan',
  PARTIALLY_REFUNDED: 'Hoan tien mot phan',
  REFUND_PENDING: 'Cho hoan tien',
  REFUNDED: 'Da hoan tien',
  SETTLEMENT_PENDING: 'Cho doi soat',
  SETTLED: 'Da doi soat',
  CHARGEBACK_OPEN: 'Dang tranh chap',
  CHARGEBACK_WON: 'Thang tranh chap',
  CHARGEBACK_LOST: 'Thua tranh chap',
  FAILED: 'That bai',
  VOIDED: 'Da huy giao dich',
  PENDING: 'Dang cho',
  UNPAID: 'Chua thanh toan',
};

const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  UNFULFILLED: 'Chua xu ly',
  ALLOCATED: 'Da phan bo',
  PICKING: 'Dang lay hang',
  PACKED: 'Da dong goi',
  SHIPPED: 'Da gui hang',
  OUT_FOR_DELIVERY: 'Dang di giao',
  DELIVERED: 'Da giao',
  FAILED: 'That bai',
  RETURN_IN_PROGRESS: 'Dang tra hang',
  RETURNED: 'Da tra hang',
};
