/**
 * Persistent rate limiter using Deno KV.
 * Survives cold starts and is shared across function instances.
 */

let kv: Deno.Kv | null = null;

async function getKv(): Promise<Deno.Kv | null> {
  if (kv) return kv;
  try {
    kv = await Deno.openKv();
    return kv;
  } catch {
    // Deno KV not available — fall back to in-memory
    return null;
  }
}

// In-memory fallback
const memoryMap = new Map<string, { count: number; resetAt: number }>();

function checkMemoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memoryMap.get(key);
  if (!entry || now > entry.resetAt) {
    memoryMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

/**
 * Check rate limit for a given key.
 * Uses Deno KV for persistence; falls back to in-memory if KV unavailable.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<boolean> {
  const store = await getKv();

  if (!store) {
    return checkMemoryLimit(key, maxRequests, windowMs);
  }

  const kvKey = ["rate_limit", key];
  const now = Date.now();

  const entry = await store.get<{ count: number; resetAt: number }>(kvKey);

  if (!entry.value || now > entry.value.resetAt) {
    await store.set(kvKey, { count: 1, resetAt: now + windowMs }, {
      expireIn: windowMs,
    });
    return true;
  }

  if (entry.value.count >= maxRequests) {
    return false;
  }

  await store.set(kvKey, { count: entry.value.count + 1, resetAt: entry.value.resetAt }, {
    expireIn: entry.value.resetAt - now,
  });
  return true;
}

/**
 * Extract a composite fingerprint from the request for rate limiting.
 * Combines IP + User-Agent hash to make spoofing harder.
 */
export function getRequestFingerprint(req: Request): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent") || "no-ua";
  // Simple hash: combine IP and a short UA fingerprint
  const uaShort = ua.slice(0, 64);
  return `${ip}::${uaShort}`;
}
