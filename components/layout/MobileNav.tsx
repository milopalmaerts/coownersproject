"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: "📊" },
  { href: "/markets", label: "Markets", icon: "📈" },
  { href: "/whales", label: "Whales", icon: "🐋" },
  { href: "/watchlist", label: "Watchlist", icon: "⭐" },
  { href: "/settings", label: "More", icon: "⚙️" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-10 flex items-center justify-around h-16 border-t border-tl-border bg-tl-bg-elevated">
      {ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`tl-mono flex flex-col items-center justify-center gap-0.5 text-[10px] uppercase tracking-wide ${
              isActive ? "text-tl-accent" : "text-tl-text-secondary"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
