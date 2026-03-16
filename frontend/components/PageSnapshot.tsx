import { PageMeta } from "@/lib/types";

interface PageSnapshotProps {
  meta: PageMeta;
}

export default function PageSnapshot({ meta }: PageSnapshotProps) {
  const stats = [
    { label: `${meta.word_count.toLocaleString()} words` },
    { label: `${meta.heading_count} sections` },
    { label: `${meta.image_count} images` },
    { label: `${meta.internal_link_count + meta.external_link_count} links` },
    { label: `Loads in ${(meta.load_time_ms / 1000).toFixed(1)}s` },
    { label: `Page size: ${meta.html_size_kb}KB` },
    { label: meta.is_https ? "🔒 Secure" : "⚠️ Not secure" },
    {
      label:
        meta.schema_types.length > 0
          ? `${meta.schema_types.length} smart tags`
          : "No smart tags",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((stat) => (
        <span
          key={stat.label}
          className="inline-flex items-center px-3 py-1.5 bg-card border border-border rounded-full text-xs text-text-muted font-medium"
        >
          {stat.label}
        </span>
      ))}
    </div>
  );
}
