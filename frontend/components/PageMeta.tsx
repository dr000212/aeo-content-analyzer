import { FileText, Heading, Image, Code2, Link2, Clock, Shield, Gauge } from "lucide-react";
import { PageMeta as PageMetaType } from "@/lib/types";

interface PageMetaProps {
  meta: PageMetaType;
}

export default function PageMeta({ meta }: PageMetaProps) {
  const stats = [
    { icon: FileText, label: "Words", value: meta.word_count.toLocaleString() },
    { icon: Heading, label: "Headings", value: meta.heading_count },
    { icon: Image, label: "Images", value: `${meta.image_count} (${meta.images_without_alt} no alt)` },
    { icon: Link2, label: "Links", value: `${meta.internal_link_count} int / ${meta.external_link_count} ext` },
    { icon: Clock, label: "Load Time", value: `${meta.load_time_ms}ms` },
    { icon: Gauge, label: "HTML Size", value: `${meta.html_size_kb}KB` },
    { icon: Shield, label: "HTTPS", value: meta.is_https ? "Yes" : "No" },
    {
      icon: Code2,
      label: "Schema Types",
      value: meta.schema_types.length > 0 ? meta.schema_types.join(", ") : "None",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-lg p-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <stat.icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-dim">{stat.label}</p>
            <p className="text-sm font-semibold text-text-main truncate">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
