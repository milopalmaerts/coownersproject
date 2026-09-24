"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function PushNotificationToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [status, setStatus] = useState<"unsupported" | "denied" | "off" | "on" | "busy">("off");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? "on" : "off");
      });
    });
  }, []);

  async function enable() {
    setStatus("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setStatus("on");
    } catch (err) {
      console.error("[push] enable failed", err);
      setStatus("off");
    }
  }

  async function disable() {
    setStatus("busy");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch (err) {
      console.error("[push] disable failed", err);
      setStatus("on");
    }
  }

  if (status === "unsupported") {
    return <Badge tone="neutral">Not supported in this browser</Badge>;
  }
  if (status === "denied") {
    return <Badge tone="neutral">Blocked — allow notifications in your browser settings</Badge>;
  }

  return (
    <button
      type="button"
      onClick={status === "on" ? disable : enable}
      disabled={status === "busy"}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
        status === "on"
          ? "border-tl-positive/40 text-tl-positive"
          : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
      }`}
    >
      {status === "busy" ? "Working…" : status === "on" ? "Enabled — tap to disable" : "Enable browser notifications"}
    </button>
  );
}
