import { NextResponse } from "next/server";
import { removePushSubscription } from "@/lib/push";

export async function POST(request: Request) {
  try {
    const { endpoint } = (await request.json()) as { endpoint?: string };
    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }
    await removePushSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
