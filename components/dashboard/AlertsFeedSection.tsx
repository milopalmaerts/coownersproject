import { getRecentAlerts, hasRedisConfig } from "@/lib/alerts/redis";
import { hasDiscordWebhook } from "@/lib/alerts/discord";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";

export async function AlertsFeedSection() {
  const recentAlerts = await getRecentAlerts().catch(() => []);

  return (
    <AlertsFeed
      alerts={recentAlerts}
      configured={hasRedisConfig && hasDiscordWebhook}
    />
  );
}
