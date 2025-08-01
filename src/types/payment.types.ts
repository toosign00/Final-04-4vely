// src/types/payment.types.ts

/**
 * PortOne 결제 요청 파라미터
 */
export interface PortOnePaymentRequest {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: 'CURRENCY_KRW';
  payMethod: 'CARD' | 'VIRTUAL_ACCOUNT' | 'TRANSFER' | 'MOBILE';
  customer?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
  };
  customData?: Record<string, unknown>;
  noticeUrls?: string[];
  confirmUrl?: string;
  appScheme?: string;
}

/**
 * PortOne 결제 응답
 */
export interface PortOnePaymentResponse {
  code?: string;
  message?: string;
  paymentId?: string;
  txId?: string;
  transactionType?: 'PAYMENT';
}

/**
 * PortOne API 결제 정보
 */
export interface PortOnePaymentInfo {
  id: string;
  transactionId: string;
  merchantId: string;
  storeId: string;
  status: 'READY' | 'PENDING' | 'VIRTUAL_ACCOUNT_ISSUED' | 'PAID' | 'CANCELLED' | 'PARTIAL_CANCELLED' | 'FAILED';
  orderName: string;
  amount: {
    total: number;
    currency: string;
    taxFree?: number;
    vat?: number;
    supply?: number;
  };
  customer?: {
    id?: string;
    name?: string;
    birthYear?: string;
    phoneNumber?: string;
    email?: string;
  };
  promotionId?: string;
  paidAt?: string;
  failedAt?: string;
  cancelledAt?: string;
}

/**
 * 결제 검증 액션 결과
 */
export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  data?: {
    orderId: string;
    paymentId: string;
    redirectUrl: string;
  };
}

/**
 * 결제 취소 요청
 */
export interface PaymentCancelRequest {
  paymentId: string;
  reason?: string;
  amount?: number;
}

/**
 * 결제 취소 결과
 */
export interface PaymentCancelResult {
  success: boolean;
  message: string;
  data?: {
    cancelledAmount: number;
    cancelledAt: string;
  };
}
