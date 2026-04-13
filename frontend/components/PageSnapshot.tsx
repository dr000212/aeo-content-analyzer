"use client";

import { motion } from "framer-motion";
import { PageMeta } from "@/lib/types";
import { Globe, FileText, Image, Link2, Clock, HardDrive, Lock, AlertTriangle, Tag } from "lucide-react";

interface PageSnapshotProps {
  meta: PageMeta;
}

function getLoadTimeColor(ms: number) {
  const s = ms / 1000;
  if (s <= 2) return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500" };
  if (s <= 4) return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500" };
  return { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: "text-red-500" };
}

function getSizeColor(kb: number) {
  if (kb <= 500) return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-500" };
  if (kb <= 1500) return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500" };
  return { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: "text-red-500" };
}

export default function PageSnapshot({ meta }: PageSnapshotProps) {
  const loadStyle = getLoadTimeColor(meta.load_time_ms);
  const sizeStyle = getSizeColor(meta.html_size_kb);

  const stats = [
    { label: `${meta.word_count.toLocaleString()} words`, Icon: FileText, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200", textColor: "text-indigo-700" },
    { label: `${meta.heading_count} sections`, Icon: Globe, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-200", textColor: "text-purple-700" },
    { label: `${meta.image_count} images`, Icon: Image, color: "text-sky-500", bg: "bg-sky-50", border: "border-sky-200", textColor: "text-sky-700" },
    { label: `${meta.internal_link_count + meta.external_link_count} links`, Icon: Link2, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-200", textColor: "text-teal-700" },
    { label: `${(meta.load_time_ms / 1000).toFixed(1)}s load`, Icon: Clock, color: loadStyle.icon, bg: loadStyle.bg, border: loadStyle.border, textColor: loadStyle.color },
    { label: `${meta.html_size_kb}KB`, Icon: HardDrive, color: sizeStyle.icon, bg: sizeStyle.bg, border: sizeStyle.border, textColor: sizeStyle.color },
    { label: meta.is_https ? "Secure" : "Not secure", Icon: meta.is_https ? Lock : AlertTriangle, color: meta.is_https ? "text-emerald-500" : "text-red-500", bg: meta.is_https ? "bg-emerald-50" : "bg-red-50", border: meta.is_https ? "border-emerald-200" : "border-red-200", textColor: meta.is_https ? "text-emerald-700" : "text-red-700" },
    { label: meta.schema_types.length > 0 ? `${meta.schema_types.length} smart tags` : "No smart tags", Icon: Tag, color: meta.schema_types.length > 0 ? "text-violet-500" : "text-slate-400", bg: meta.schema_types.length > 0 ? "bg-violet-50" : "bg-slate-50", border: meta.schema_types.length > 0 ? "border-violet-200" : "border-slate-200", textColor: meta.schema_types.length > 0 ? "text-violet-700" : "text-slate-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2.5">
      {stats.map((stat, i) => (
        <motion.span
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className={`inline-flex items-center gap-2 px-3.5 py-2 ${stat.bg} border ${stat.border} rounded-xl text-sm font-medium ${stat.textColor} hover:shadow-sm transition-shadow`}
        >
          <stat.Icon className={`w-4 h-4 ${stat.color}`} />
          {stat.label}
        </motion.span>
      ))}
    </div>
  );
}
