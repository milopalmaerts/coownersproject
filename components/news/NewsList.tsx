import { NewsItem } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function NewsList({
  title,
  news,
  unavailable = false,
}: {
  title?: string;
  news: NewsItem[];
  unavailable?: boolean;
}) {
  if (unavailable) {
    return (
      <Card>
        {title && <CardHeader title={title} />}
        <p className="text-sm text-tl-text-muted">
          News is temporarily unavailable — the aggregator couldn&apos;t
          reach any of its sources. Try again in a moment.
        </p>
      </Card>
    );
  }

  if (news.length === 0) {
    return (
      <Card>
        {title && <CardHeader title={title} />}
        <p className="text-sm text-tl-text-muted">No news to show right now.</p>
      </Card>
    );
  }

  return (
    <Card>
      {title && <CardHeader title={title} />}
      <ul className="divide-y divide-tl-border">
        {news.map((item) => (
          <li key={item.id} className="py-3 first:pt-0 last:pb-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge tone="neutral">{item.category}</Badge>
                <span className="text-xs text-tl-text-muted">
                  {formatRelativeTime(item.publishedAt)}
                </span>
              </div>
              <div className="text-sm font-medium text-tl-text-primary group-hover:text-tl-accent transition-colors">
                {item.title}
              </div>
              <div className="text-xs text-tl-text-secondary mt-1">
                {item.description}
              </div>
              <div className="text-xs text-tl-text-muted mt-1">
                {item.source}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
