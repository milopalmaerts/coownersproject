import { getCurrentUser } from "@/lib/supabase/server";
import { JournalApp } from "@/components/journal/JournalApp";

export default async function JournalPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 15 · Trading Journal</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Journal</h1>
        <p className="text-sm text-tl-text-secondary">
          R-multiple performance tracking, partial take profits, psychology
          notes, and daily/weekly/monthly reviews.
        </p>
      </div>
      <JournalApp userId={user?.id ?? null} />
    </div>
  );
}
