/**
 * API transport layer and async SHA-256 prompt cache.
 * Proxy-only mode — no direct API calls with user-supplied keys.
 *
 * @module apiClient
 */

const PROXY_BASE = 'http://localhost:3001';
const CACHE_PREFIX = 'faceCache:';

/**
 * Check if the dev proxy server is running.
 * @returns {Promise<boolean>}
 */
export async function checkProxyAvailable() {
  try {
    const res = await fetch(`${PROXY_BASE}/health`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Compute a SHA-256 hash of a string, returning the first 16 hex characters.
 * @param {string} input
 * @returns {Promise<string>}
 */
async function sha256Short(input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 16);
}

/**
 * Look up a cached face image by prompt hash.
 * @param {string} prompt
 * @returns {Promise<{imageDataUrl: string, generatedAt: string} | null>}
 */
export async function getCachedFace(prompt) {
  const hash = await sha256Short(prompt);
  const key = `${CACHE_PREFIX}${hash}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached && cached.imageDataUrl) return cached;
    return null;
  } catch {
    return null;
  }
}

/**
 * Store a face image in the prompt cache.
 * @param {string} prompt
 * @param {string} imageDataUrl
 * @param {string} generatedAt
 */
async function cacheFace(prompt, imageDataUrl, generatedAt) {
  const hash = await sha256Short(prompt);
  const key = `${CACHE_PREFIX}${hash}`;
  try {
    localStorage.setItem(key, JSON.stringify({ imageDataUrl, generatedAt }));
  } catch {
    // localStorage quota exceeded — cache is best-effort
  }
}

/**
 * @typedef {Object} FaceResult
 * @property {string} [imageDataUrl]
 * @property {string} [generatedAt]
 * @property {string} [error]
 */

/**
 * Generate a face image by calling the dev proxy, with caching.
 * @param {string} prompt - The full prompt string
 * @returns {Promise<FaceResult>}
 */
export async function generateFaceImage(prompt) {
  // Check cache first
  const cached = await getCachedFace(prompt);
  if (cached) {
    return {
      imageDataUrl: cached.imageDataUrl,
      generatedAt: cached.generatedAt,
      fromCache: true,
    };
  }

  // Call the proxy
  try {
    const res = await fetch(`${PROXY_BASE}/api/generate-face`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { error: `API error (${res.status}): ${body}` };
    }

    const data = await res.json();

    if (!data.imageDataUrl) {
      return { error: 'No image data in API response' };
    }

    const generatedAt = new Date().toISOString();

    // Cache the result
    await cacheFace(prompt, data.imageDataUrl, generatedAt);

    return {
      imageDataUrl: data.imageDataUrl,
      generatedAt,
      fromCache: false,
    };
  } catch (err) {
    return { error: `Network error: ${err.message}` };
  }
}
