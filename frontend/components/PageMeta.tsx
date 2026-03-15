import { FileText, Heading, Image, Code2 } from "lucide-react";
import { PageMeta as PageMetaType } from "@/lib/types";

interface PageMetaProps {
  meta: PageMetaType;
}

export default function PageMeta({ meta }: PageMetaProps) {
  const stats = [
    { icon: FileText, label: "Words", value: meta.word_count.toLocaleString() },
    { icon: Heading, label: "Headings", value: meta.heading_count },
    { icon: Image, label: "Images", value: meta.image_count },
    {
      icon: Code2,
      label: "Schema Types",
      value: meta.schema_types.length > 0 ? meta.schema_types.join(", ") : "None",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
