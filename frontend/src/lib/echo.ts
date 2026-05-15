import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

/**
 * Laravel Echo configured against a Reverb server. Reverb speaks the Pusher
 * protocol so we use the pusher-js client.
 *
 * Returns null when Reverb env vars are not configured — call sites must
 * gracefully degrade (we just won't get live updates in that case).
 */
let cached: Echo<'reverb'> | null | undefined;

export function getEcho(): Echo<'reverb'> | null {
  if (cached !== undefined) return cached;

  const key    = import.meta.env.VITE_REVERB_APP_KEY;
  const host   = import.meta.env.VITE_REVERB_HOST;
  const port   = import.meta.env.VITE_REVERB_PORT;
  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';

  if (!key || !host) {
    cached = null;
    return null;
  }

  // pusher-js is required by laravel-echo's "reverb" broadcaster.
  // Attach to window so the runtime can find it. Avoid `any` by casting once.
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  cached = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: Number(port ?? 8080),
    wssPort: Number(port ?? 8080),
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
  });

  return cached;
}
