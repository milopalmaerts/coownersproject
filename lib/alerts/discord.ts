export const hasDiscordWebhook = Boolean(process.env.DISCORD_WEBHOOK_URL);

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  url?: string;
  timestamp?: string;
}

const COLOR_POSITIVE = 0x2fd480;
const COLOR_NEGATIVE = 0xf24d5c;
const COLOR_INFO = 0x4d8cf2;

export { COLOR_POSITIVE, COLOR_NEGATIVE, COLOR_INFO };

export async function postDiscordEmbed(embed: DiscordEmbed): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL is not configured");
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed], username: "TradingLegends" }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Discord webhook failed: ${res.status} ${body}`);
  }
}
