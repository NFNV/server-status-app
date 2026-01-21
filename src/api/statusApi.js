/**
 * Status API Client
 *
 * Connects to the backend status API running on the VM.
 * Handles network errors gracefully and returns normalized status data.
 */

// Get the base URL from environment variables
// In Vite, env vars are prefixed with VITE_ and accessed via import.meta.env
const RAW_BASE_URL = import.meta.env.VITE_STATUS_API_BASE_URL || 'http://127.0.0.1:8080';
const NORMALIZED_BASE_URL = normalizeBaseUrl(RAW_BASE_URL);
// Use a dev proxy path when the backend doesn't allow localhost CORS.
const DEV_PROXY_PATH = '/__status_api';
const BASE_URL = shouldUseDevProxy(NORMALIZED_BASE_URL)
  ? DEV_PROXY_PATH
  : NORMALIZED_BASE_URL;

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '');
}

function shouldUseDevProxy(baseUrl) {
  if (!import.meta.env.DEV || !baseUrl) {
    return false;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  if (baseUrl.startsWith('/')) {
    return false;
  }

  try {
    return new URL(baseUrl).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Fetch server status from the backend API
 *
 * @returns {Promise<Object>} Result with normalized status when successful:
 *   - ok: boolean - True when the request succeeds
 *   - data.online: boolean - Whether the server is online
 *   - data.state: string - Container state (fallback "unknown")
 *   - data.checkedAt: Date | null - Backend checked timestamp
 *   - data.name: string | null - Server name
 *   - data.players: number | null - Current player count
 *   - data.maxPlayers: number | null - Maximum player capacity
 *   - data.lastUpdated: Date - Timestamp of this check
 *   - data.latencyMs: number | null - Response time for the status call
 *
 * If the backend is unreachable or returns an error, returns `{ ok: false, error, latencyMs }`.
 */
export async function fetchServerStatus() {
  const startTime = performance.now();
  try {
    // Fetch with a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${BASE_URL}/status`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - startTime);

    // Handle non-2xx responses
    if (!response.ok) {
      console.warn(`Status API returned ${response.status}: ${response.statusText}`);
      return { ok: false, error: 'http', latencyMs };
    }

    const data = await response.json();
    const checkedAt = parseCheckedAt(data.checked_at);

    // Normalize the response
    return {
      ok: true,
      data: {
        online: Boolean(data.online || data.server_running),
        state: typeof data.container_state === 'string' && data.container_state.trim()
          ? data.container_state
          : 'unknown',
        checkedAt,
        name: data.name ?? null,
        players: typeof data.players === 'number' ? data.players : null,
        maxPlayers: typeof data.max_players === 'number' ? data.max_players : null,
        lastUpdated: checkedAt || new Date(),
        latencyMs,
      },
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - startTime);
    // Handle network errors, timeouts, CORS issues, etc.
    if (error.name === 'AbortError') {
      console.warn('Status API request timed out');
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('Failed to fetch server status. This is often caused by CORS or the backend being unreachable.');
    } else {
      console.warn('Failed to fetch server status:', error.message);
    }

    return { ok: false, error: 'network', latencyMs };
  }
}

function parseCheckedAt(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Check backend health endpoint (optional utility)
 *
 * @returns {Promise<boolean>} True if backend is healthy
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'ok';

  } catch (error) {
    return false;
  }
}
