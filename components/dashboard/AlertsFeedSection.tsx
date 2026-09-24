import { getRecentAlerts, hasRedisConfig } from "@/lib/alerts/redis";
import { hasDiscordWebhook } from "@/lib/alerts/discord";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";

export async function AlertsFeedSection() {
  // getRecentAlerts now returns up to 250 (for the /track-record page) —
  // the compact dashboard card only shows the latest handful.
  const recentAlerts = await getRecentAlerts().catch(() => []);

  return (
    <AlertsFeed
      alerts={recentAlerts.slice(0, 5)}
      configured={hasRedisConfig && hasDiscordWebhook}
    />
  );
}
