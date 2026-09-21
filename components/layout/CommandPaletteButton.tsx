"use client";

export function CommandPaletteButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className="hidden md:flex items-center gap-2 text-sm text-tl-text-muted border border-tl-border rounded-lg px-3 py-1.5 hover:border-tl-accent/50 hover:text-tl-text-secondary transition-colors"
    >
      <span>🔍</span>
      <span>Search</span>
      <kbd className="text-xs border border-tl-border rounded px-1.5 py-0.5 ml-2">
        ⌘K
      </kbd>
    </button>
  );
}
