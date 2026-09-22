import { NextResponse } from "next/server";
import { whaleProvider } from "@/lib/providers";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

// Backs client-side polling for the mega-whale sound alert — reads through
// the same provider/cache the whale pages already use.
export async function GET(request: Request) {
  const { success } = await checkRateLimit(`whales:${clientIp(request)}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const transactions = await whaleProvider.getLargeTransactions(10);
    return NextResponse.json({ transactions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load whale transactions" },
      { status: 502 }
    );
  }
}
