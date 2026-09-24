import { NextResponse } from "next/server";
import { addPushSubscription, PushSubscriptionJSON } from "@/lib/push";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscriptionJSON;
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    await addPushSubscription(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to subscribe" },
      { status: 500 }
    );
  }
}
