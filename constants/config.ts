import Constants from 'expo-constants';

/**
 * Default matches existing app behavior. Override per environment:
 * - `.env`: EXPO_PUBLIC_API_URL=https://your-api.com/api
 * - `app.json` → expo.extra.apiUrl (optional)
 */
/** Matches NestJS default in my-daily-buddy-backend/src/main.ts. Override via EXPO_PUBLIC_API_URL for device testing. */
const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExtra = (
    Constants.expoConfig?.extra as { apiUrl?: string } | undefined
  )?.apiUrl;

  const resolved =
    typeof fromEnv === 'string' && fromEnv.length > 0
      ? fromEnv
      : typeof fromExtra === 'string' && fromExtra.length > 0
        ? fromExtra
        : DEFAULT_API_BASE_URL;

  return normalizeBaseUrl(resolved);
}
