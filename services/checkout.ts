import {
  createCheckout,
  verifyPayment,
  type CheckoutPayload,
  type MockCompletion,
  type VerifyResult,
} from '@/services/paymentAPI';

export type CheckoutSession =
  | { mode: 'mock'; result: VerifyResult }
  | { mode: 'razorpay'; checkout: CheckoutPayload };

/**
 * Starts checkout. Mock provider completes immediately.
 * Razorpay returns checkout options for the WebView modal.
 */
export async function startPlanCheckout(planId: string): Promise<CheckoutSession> {
  const { checkout } = await createCheckout(planId);

  if (checkout.provider === 'mock' && checkout.mock_completion) {
    const result = await verifyPayment(checkout.mock_completion);
    return { mode: 'mock', result };
  }

  return { mode: 'razorpay', checkout };
}

export async function finishPlanCheckout(proof: MockCompletion): Promise<VerifyResult> {
  return verifyPayment(proof);
}
