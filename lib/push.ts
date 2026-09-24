import webpush from "web-push";
import { Redis } from "@upstash/redis";
import { hasRedisConfig } from "@/lib/alerts/redis";

export const hasVapidConfig = Boolean(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
);

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!hasVapidConfig) throw new Error("VAPID keys are not configured");
  webpush.setVapidDetails(
    "mailto:noreply@tradinglegends.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

const SUBSCRIPTIONS_KEY = "push:subscriptions";

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// Global subscriber set (like the Discord alert engine, this isn't per-user
// — anyone who opts in gets every price alert, no personal alert config).
export async function addPushSubscription(sub: PushSubscriptionJSON): Promise<void> {
  if (!hasRedisConfig) throw new Error("Redis is not configured");
  await getRedis().hset(SUBSCRIPTIONS_KEY, { [sub.endpoint]: JSON.stringify(sub) });
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  if (!hasRedisConfig) return;
  await getRedis().hdel(SUBSCRIPTIONS_KEY, endpoint);
}

async function getAllSubscriptions(): Promise<PushSubscriptionJSON[]> {
  if (!hasRedisConfig) return [];
  const all = await getRedis().hgetall<Record<string, string>>(SUBSCRIPTIONS_KEY);
  if (!all) return [];
  return Object.values(all).map((v) => (typeof v === "string" ? JSON.parse(v) : v));
}

// Sends to every subscriber, pruning any that have expired/unsubscribed
// (Web Push returns 404/410 for those) so the list doesn't grow stale.
export async function broadcastPush(title: string, body: string, url?: string): Promise<number> {
  if (!hasRedisConfig || !hasVapidConfig) return 0;
  ensureConfigured();

  const subs = await getAllSubscriptions();
  const payload = JSON.stringify({ title, body, url: url ?? "/dashboard" });

  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as webpush.PushSubscription, payload);
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await removePushSubscription(sub.endpoint);
        } else {
          console.error("[push] send failed", err);
        }
      }
    })
  );

  return sent;
}
