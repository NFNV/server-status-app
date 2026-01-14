/**
 * Status API Client
 *
 * Connects to the backend status API running on the VM.
 * Handles network errors gracefully and returns normalized status data.
 */

// Get the base URL from environment variables
// In Vite, env vars are prefixed with VITE_ and accessed via import.meta.env
const RAW_BASE_URL = import.meta.env.VITE_STATUS_API_BASE_URL || 'http://127.0.0.1:8080';
const BASE_URL = normalizeBaseUrl(RAW_BASE_URL);

function normalizeBaseUrl(url) {
  return url.replace(/\/+$/, '');
}

/**
 * Fetch server status from the backend API
 *
 * @returns {Promise<Object>} Normalized status object:
 *   - online: boolean - Whether the server is online
 *   - name: string | null - Server name
 *   - players: number - Current player count
 *   - maxPlayers: number | null - Maximum player capacity
 *   - lastUpdated: Date - Timestamp of this check
 *   - latencyMs: number | null - Response time for the status call
 *
 * If the backend is unreachable or returns an error, returns a safe "offline" object.
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
      return createOfflineStatus({ latencyMs });
    }

    const data = await response.json();

    // Normalize the response
    return {
      online: Boolean(data.online),
      name: data.name || null,
      players: typeof data.players === 'number' ? data.players : 0,
      maxPlayers: typeof data.max_players === 'number' ? data.max_players : null,
      lastUpdated: new Date(),
      latencyMs,
    };

  } catch (error) {
    // Handle network errors, timeouts, CORS issues, etc.
    if (error.name === 'AbortError') {
      console.warn('Status API request timed out');
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('Failed to fetch server status. This is often caused by CORS or the backend being unreachable.');
    } else {
      console.warn('Failed to fetch server status:', error.message);
    }

    return createOfflineStatus();
  }
}

/**
 * Create a safe "offline" status object
 * Used when the backend is unreachable or returns an error
 */
function createOfflineStatus(overrides = {}) {
  return {
    online: false,
    name: null,
    players: 0,
    maxPlayers: null,
    lastUpdated: new Date(),
    latencyMs: null,
    ...overrides,
  };
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
