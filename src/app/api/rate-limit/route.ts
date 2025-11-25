import { NextResponse } from "next/server";

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 30 * 1000; // 1 minute

export async function POST(request: Request) {
  // Get IP from headers (standard for Vercel/Next.js)
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  const now = Date.now();
  const lastRequestTime = rateLimitMap.get(ip);

  if (lastRequestTime && now - lastRequestTime < RATE_LIMIT_WINDOW) {
    const remainingTime = Math.ceil(
      (RATE_LIMIT_WINDOW - (now - lastRequestTime)) / 1000
    );
    return NextResponse.json(
      { error: `Rate limit exceeded. Please wait ${remainingTime} seconds.` },
      { status: 429 }
    );
  }

  rateLimitMap.set(ip, now);

  // Cleanup old entries periodically (simple cleanup)
  if (rateLimitMap.size > 1000) {
    for (const [key, time] of rateLimitMap.entries()) {
      if (now - time > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(key);
      }
    }
  }

  return NextResponse.json({ success: true });
}
