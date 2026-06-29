import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API base URL resolution:
 * 1. EXPO_PUBLIC_API_URL in .env (highest priority)
 * 2. expo.extra.apiUrl in app.json
 * 3. Dev auto-detect: Expo Metro host IP for physical devices (QR / Expo Go)
 * 4. Android emulator → 10.0.2.2
 * 5. Default localhost:5001 (web + iOS simulator)
 */
const DEFAULT_API_BASE_URL = 'http://localhost:5001/api';
const DEFAULT_PORT = 5001;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function extractPort(url: URL): number {
  if (url.port) return Number(url.port);
  return url.protocol === 'https:' ? 443 : 80;
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/** Metro / Expo Go host IP — same machine as backend when testing on a real phone. */
function getExpoDevHost(): string | null {
  const manifest = Constants.manifest as { debuggerHost?: string } | null;
  const manifest2 = Constants.manifest2 as
    | { extra?: { expoClient?: { hostUri?: string } } }
    | null;

  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost,
    manifest?.debuggerHost,
    manifest2?.extra?.expoClient?.hostUri,
  ];

  for (const uri of candidates) {
    if (!uri) continue;
    const host = String(uri).split(':')[0]?.trim();
    if (host && !isLocalHost(host)) return host;
  }

  return null;
}

/** Optional manual override when auto-detect fails (set Mac LAN IP in .env). */
function getLanHostOverride(): string | null {
  const host = process.env.EXPO_PUBLIC_DEV_LAN_HOST?.trim();
  if (host && !isLocalHost(host)) return host;
  return null;
}

/** localhost in .env does not reach your Mac from a phone — rewrite in dev. */
function resolveDevApiUrl(baseUrl: string): string {
  if (!__DEV__) return normalizeBaseUrl(baseUrl);

  try {
    const url = new URL(baseUrl);

    if (Platform.OS === 'web') {
      return normalizeBaseUrl(baseUrl);
    }

    if (!isLocalHost(url.hostname)) {
      return normalizeBaseUrl(baseUrl);
    }

    // 1. Expo Go / QR on physical phone — Metro host IP (e.g. 192.168.x.x)
    const expoHost = getExpoDevHost() ?? getLanHostOverride();
    if (expoHost) {
      url.hostname = expoHost;
      return normalizeBaseUrl(url.toString());
    }

    // 2. Android emulator only (no Metro host available)
    if (Platform.OS === 'android') {
      url.hostname = '10.0.2.2';
      return normalizeBaseUrl(url.toString());
    }

    // 3. iOS simulator
    return normalizeBaseUrl(baseUrl);
  } catch {
    return normalizeBaseUrl(baseUrl);
  }
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return resolveDevApiUrl(fromEnv);
  }

  const fromExtra = (
    Constants.expoConfig?.extra as { apiUrl?: string } | undefined
  )?.apiUrl;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return resolveDevApiUrl(fromExtra);
  }

  if (__DEV__) {
    const expoHost = getExpoDevHost() ?? getLanHostOverride();
    if (expoHost && Platform.OS !== 'web') {
      return `http://${expoHost}:${DEFAULT_PORT}/api`;
    }
    if (Platform.OS === 'android') {
      return `http://10.0.2.2:${DEFAULT_PORT}/api`;
    }
  }

  return DEFAULT_API_BASE_URL;
}

export function getApiConnectionHint(): string {
  const url = getApiBaseUrl();
  const expoHost = getExpoDevHost();

  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return 'Start backend: cd my-daily-buddy-backend && npm run start:dev';
  }
  if (url.includes('10.0.2.2')) {
    return `Android emulator — backend must run on port ${extractPort(new URL(url))}`;
  }
  if (expoHost) {
    return `Phone must reach backend at ${url} (same Wi-Fi as Mac)`;
  }
  return `Check backend is running at ${url}`;
}

/** Dev-only: log how the API URL was resolved (call from api interceptor). */
export function logApiUrlResolution(): void {
  if (!__DEV__) return;
  const url = getApiBaseUrl();
  const expoHost = getExpoDevHost();
  const override = getLanHostOverride();
  console.log('[API] base URL:', url);
  console.log('[API] platform:', Platform.OS, '| expo host:', expoHost ?? 'none', '| LAN override:', override ?? 'none');
}
