import { getApiConnectionHint } from '@/constants/config';

export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const e = err as {
    response?: { data?: { message?: unknown }; status?: number };
    message?: string;
    code?: string;
  };

  if (!e?.response) {
    if (e?.code === 'ECONNABORTED') {
      return 'Request timed out. OTP email can take a moment — check your inbox or backend logs, then try again.';
    }
    if (e?.message === 'Network Error' || e?.code === 'ERR_NETWORK') {
      return `Cannot reach server. ${getApiConnectionHint()}`;
    }
  }

  const msg = e?.response?.data?.message ?? e?.message ?? fallback;
  return Array.isArray(msg) ? String(msg[0]) : String(msg);
}

export function isAuthError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 401;
}

export function isNetworkError(err: unknown): boolean {
  const e = err as { response?: unknown; message?: string; code?: string };
  return (
    !e?.response &&
    (e?.message === 'Network Error' || e?.code === 'ERR_NETWORK' || e?.code === 'ECONNABORTED')
  );
}
