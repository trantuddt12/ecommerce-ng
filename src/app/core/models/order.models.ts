export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PACKING'
  | 'READY_TO_SHIP'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELIVERY_FAILED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUND_PENDING'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED'
  | 'VOIDED';

export type FulfillmentStatus =
  | 'UNFULFILLED'
  | 'ALLOCATED'
  | 'PICKING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURN_IN_PROGRESS'
  | 'RETURNED';

export type OrderAction =
  | 'CANCEL_ORDER'
  | 'REQUEST_RETURN'
  | 'PAY_NOW'
  | 'CONFIRM_ORDER'
  | 'MARK_PACKING'
  | 'MARK_READY_TO_SHIP'
  | 'MARK_SHIPPING'
  | 'MARK_DELIVERED'
  | 'MARK_DELIVERY_FAILED';

export interface OrderListItem {
  id: number;
  orderNumber: string;
  orderStatus: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  fulfillmentStatus: FulfillmentStatus | string;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  totalItems: number;
  grandTotal: number;
  currencyCode: string | null;
  canCancel: boolean;
  canReturn: boolean;
  canPay: boolean;
  placedAt: string | null;
}

export interface OrderItem {
  id: number | null;
  productId: number;
  variantId: number;
  productCode: string | null;
  productName: string;
  variantName: string | null;
  variantAttributes: string | null;
  sku: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  itemDiscountAmount: number;
  lineSubtotal: number;
}

export interface OrderStatusHistory {
  id: number | null;
  orderStatus: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  fulfillmentStatus: FulfillmentStatus | string;
  changedBy: string | null;
  source: string | null;
  note: string | null;
  changedAt: string | null;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  orderStatus: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  fulfillmentStatus: FulfillmentStatus | string;
  customerId: number | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  provinceCode: string | null;
  districtCode: string | null;
  wardCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  shippingMethodCode: string | null;
  shippingMethodName: string | null;
  paymentMethodCode: string | null;
  paymentMethodName: string | null;
  trackingNumber: string | null;
  carrierCode: string | null;
  customerNote: string | null;
  internalNote: string | null;
  cancelReason: string | null;
  totalItems: number;
  subtotalAmount: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  currencyCode: string | null;
  placedAt: string | null;
  confirmedAt: string | null;
  inventoryReservedAt: string | null;
  shippedAt: string | null;
  inventoryDeductedAt: string | null;
  cancelledAt: string | null;
  deliveredAt: string | null;
  refundedAt: string | null;
  canCancel: boolean;
  canReturn: boolean;
  canPay: boolean;
  availableActions: string[];
  items: OrderItem[];
  histories: OrderStatusHistory[];
}

export interface OrderAdminStatusUpdateRequest {
  orderStatus?: OrderStatus | null;
  paymentStatus?: PaymentStatus | null;
  fulfillmentStatus?: FulfillmentStatus | null;
  trackingNumber?: string | null;
  carrierCode?: string | null;
  cancelReason?: string | null;
  returnReason?: string | null;
  internalNote?: string | null;
}

export interface CustomerOrderCancelRequest {
  cancelReason: string;
}

export interface CustomerOrderReturnRequest {
  cancelReason: string;
}

export interface OrderListFilters {
  orderNumber?: string | null;
  orderStatus?: string | null;
  paymentStatus?: string | null;
  customerPhone?: string | null;
  page?: number;
  size?: number;
  sortBy?: 'orderNumber' | 'grandTotal' | 'createdAt' | 'lastModifiedAt' | 'placedAt' | string;
  sortDir?: 'asc' | 'desc';
}

export interface PagedResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export type CartStatus = 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED';
export type CartVoucherType = 'FIXED' | 'PERCENT' | null;

export interface CartItem {
  id: number | null;
  productId: number;
  variantId: number;
  productCode: string | null;
  productName: string;
  variantName: string | null;
  variantAttributes: string | null;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  compareAtPrice: number | null;
  lineSubtotal: number;
  availableQty: number | null;
  inventoryStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDERABLE' | null;
  canAddToCart?: boolean | null;
  canCheckout?: boolean | null;
  lowStockMessage?: string | null;
}

export interface Cart {
  id: number;
  customerId: number | null;
  status: CartStatus | string;
  voucherCode: string | null;
  voucherType: CartVoucherType | string;
  voucherValue: number | null;
  totalItems: number;
  subtotalAmount: number;
  discountAmount: number;
  grandTotal: number;
  currencyCode: string | null;
  updatedAt: string | null;
  items: CartItem[];
}

export interface CheckoutPricingPreview {
  totalItems: number;
  subtotalAmount: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  currencyCode: string | null;
  voucherCode: string | null;
}

export interface CartItemUpsertRequest {
  variantId: number;
  quantity: number;
}

export interface CartApplyVoucherRequest {
  voucherCode: string;
}

export interface CheckoutFromCartRequest {
  recipientName: string;
  recipientPhone: string;
  provinceCode?: string | null;
  districtCode?: string | null;
  wardCode?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  shippingMethodCode?: string | null;
  shippingMethodName?: string | null;
  paymentMethodCode?: string | null;
  paymentMethodName?: string | null;
  customerNote?: string | null;
}
