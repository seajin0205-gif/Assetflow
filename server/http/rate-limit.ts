import type { Request, RequestHandler } from "express";
import { problem, sendProblem } from "./problem";

type Bucket = {
  timestamps: number[];
};

/**
 * Fixed sliding window: at most `limit` requests per `windowMs` for one client.
 * The client is the authenticated account (`X-User-Id`) when that header is
 * present, otherwise the socket IP. Session auth should replace the header
 * before this is exposed beyond the demo account.
 */
export function tradingRateLimit(limit = 10, windowMs = 1000): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    const key = clientKey(req);
    const now = Date.now();
    const bucket = buckets.get(key) ?? { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter(
      (stamp) => now - stamp < windowMs,
    );

    if (bucket.timestamps.length >= limit) {
      const oldest = bucket.timestamps[0] ?? now;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + windowMs - now) / 1000),
      );
      buckets.set(key, bucket);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      sendProblem(
        res,
        problem(
          429,
          "rate-limited",
          "Too Many Requests",
          `Trading endpoints accept at most ${limit} requests per second for this client.`,
          req.originalUrl,
        ),
      );
      return;
    }

    bucket.timestamps.push(now);
    buckets.set(key, bucket);
    next();
  };
}

function clientKey(req: Request): string {
  const user = req.get("X-User-Id");
  if (user && /^[A-Za-z0-9_-]{1,64}$/.test(user)) return `user:${user}`;
  return `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
}
