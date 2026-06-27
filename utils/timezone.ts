/** IANA timezone for API query params (backend defaults to Asia/Kolkata). */
export function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

export function getTodayDateString(): string {
  return new Date().toLocaleDateString('sv-SE');
}

export function formatTime(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export const GLASS_ML = 250;

export function mlToGlasses(ml: number): number {
  return Math.round(ml / GLASS_ML);
}

export function glassesToMl(glasses: number): number {
  return glasses * GLASS_ML;
}
