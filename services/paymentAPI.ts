import api from './api';

export type PaymentProvider = 'razorpay' | 'mock';

export interface PaymentConfig {
  provider: PaymentProvider;
  key_id: string | null;
  currency: string;
}

export interface MockCompletion {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CheckoutPayload {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  name: string;
  description: string;
  prefill?: Record<string, string>;
  notes?: Record<string, string>;
  mock_completion?: MockCompletion;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: string;
  provider: PaymentProvider;
  paid_at: string | null;
  plan?: {
    id: string;
    name: string;
    plan_code: string;
    price: number;
  };
}

export interface CheckoutResult {
  payment: PaymentRecord;
  checkout: CheckoutPayload;
}

export interface VerifyResult {
  alreadyPaid: boolean;
  payment: PaymentRecord;
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const response = await api.get<{ data: PaymentConfig }>('/payments/config');
  return response.data.data;
}

export async function createCheckout(planId: string): Promise<CheckoutResult> {
  const response = await api.post<{ data: CheckoutResult }>('/payments/checkout', {
    plan_id: planId,
  });
  return response.data.data;
}

export async function verifyPayment(payload: MockCompletion): Promise<VerifyResult> {
  const response = await api.post<{ data: VerifyResult }>('/payments/verify', payload);
  return response.data.data;
}

export async function listMyPayments(params?: {
  page?: number;
  limit?: number;
}): Promise<PaymentRecord[]> {
  const response = await api.get<{ data: PaymentRecord[] }>('/payments/me', { params });
  return response.data.data;
}
