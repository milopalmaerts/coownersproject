import { NextResponse } from "next/server";
import { derivativesProvider } from "@/lib/providers";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const { success } = await checkRateLimit(`public-funding:${clientIp(request)}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const rates = await derivativesProvider.getFundingRates();
    return NextResponse.json({ rates });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load funding rates" },
      { status: 502 }
    );
  }
}
