export function getErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  const e = err as {
    response?: { data?: { message?: unknown } };
    message?: string;
  };
  const msg = e?.response?.data?.message ?? e?.message ?? fallback;
  return Array.isArray(msg) ? String(msg[0]) : String(msg);
}
