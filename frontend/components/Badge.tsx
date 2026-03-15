interface BadgeProps {
  text: string;
  variant?: "critical" | "high" | "medium" | "low" | "neutral";
}

const variantStyles: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-green-50 text-green-700 border-green-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

export function priorityToVariant(
  priority: string
): "critical" | "high" | "medium" | "low" {
  switch (priority) {
    case "Critical":
      return "critical";
    case "High":
      return "high";
    case "Medium":
      return "medium";
    default:
      return "low";
  }
}

export default function Badge({ text, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
    >
      {text}
    </span>
  );
}
