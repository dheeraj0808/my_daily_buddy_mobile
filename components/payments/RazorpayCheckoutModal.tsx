import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import AppText from '@/components/ui/AppText';
import type { CheckoutPayload, MockCompletion } from '@/services/paymentAPI';
import { palette, spacing } from '@/theme';

type Props = {
  visible: boolean;
  checkout: CheckoutPayload | null;
  prefill?: { email?: string; name?: string; contact?: string };
  onSuccess: (proof: MockCompletion) => void;
  onCancel: () => void;
  onError: (message: string) => void;
};

function buildHtml(
  checkout: CheckoutPayload,
  prefill?: { email?: string; name?: string; contact?: string },
): string {
  const options = {
    key: checkout.key_id,
    amount: checkout.amount,
    currency: checkout.currency,
    name: checkout.name,
    description: checkout.description,
    order_id: checkout.order_id,
    notes: checkout.notes ?? {},
    prefill: {
      email: prefill?.email ?? '',
      name: prefill?.name ?? '',
      contact: prefill?.contact ?? '',
      ...(checkout.prefill ?? {}),
    },
    theme: { color: '#0d9488' },
  };

  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <style>
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        background: #f8fafc; display: flex; align-items: center; justify-content: center;
        min-height: 100vh; color: #334155; }
    </style>
  </head>
  <body>
    <p>Opening secure checkout…</p>
    <script>
      (function () {
        var options = ${JSON.stringify(options)};
        options.handler = function (response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'success',
            payload: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }
          }));
        };
        options.modal = {
          ondismiss: function () {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cancel' }));
          }
        };
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          var msg = (response && response.error && (response.error.description || response.error.reason))
            || 'Payment failed.';
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: msg }));
        });
        rzp.open();
      })();
    </script>
  </body>
</html>`;
}

export default function RazorpayCheckoutModal({
  visible,
  checkout,
  prefill,
  onSuccess,
  onCancel,
  onError,
}: Props) {
  const html = useMemo(
    () => (checkout ? buildHtml(checkout, prefill) : ''),
    [checkout, prefill],
  );

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type: string;
        payload?: MockCompletion;
        message?: string;
      };
      if (data.type === 'success' && data.payload) {
        onSuccess(data.payload);
        return;
      }
      if (data.type === 'cancel') {
        onCancel();
        return;
      }
      onError(data.message || 'Payment failed.');
    } catch {
      onError('Unable to read payment result.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={styles.container}>
        <AppText variant="title" style={styles.title}>
          Complete payment
        </AppText>
        {checkout && html ? (
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            onMessage={onMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator color={palette.primary} />
              </View>
            )}
            javaScriptEnabled
            domStorageEnabled
            style={styles.webview}
          />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color={palette.primary} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    paddingTop: spacing.xl,
  },
  title: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
  },
});
