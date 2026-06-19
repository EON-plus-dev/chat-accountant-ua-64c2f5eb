const allowedOrigins = [
  Deno.env.get("SITE_URL") || "",
  "https://fintodo.com.ua",
  "http://localhost:5173",
  "http://localhost:8080",
].filter(Boolean);

// Match any Lovable preview URL pattern
const previewPatterns = [
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = allowedOrigins.includes(origin) || previewPatterns.some(p => p.test(origin));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0] || "https://fintodo.com.ua",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}
