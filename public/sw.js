// Minimal service worker just for Web Push — no offline caching, so it
// can't serve stale content or mask a real network failure.
self.addEventListener("push", (event) => {
  let data = { title: "TradingLegends", body: "New alert", url: "/dashboard" };
  try {
    data = event.data.json();
  } catch {
    // ignore malformed payloads
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
