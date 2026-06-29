type SessionListener = () => void;

const listeners = new Set<SessionListener>();

/** Fired when access + refresh tokens are invalid (user must sign in again). */
export function onSessionExpired(listener: SessionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSessionExpired(): void {
  listeners.forEach((fn) => fn());
}
