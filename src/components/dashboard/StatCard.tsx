import type { LucideIcon } from "lucide-react";

type StatTone = "green" | "amber" | "blue" | "red";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone: StatTone;
}

const toneStyles: Record<StatTone, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  blue: "bg-blue-50 text-blue-700",
  red: "bg-red-50 text-red-700",
};

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${toneStyles[tone]}`}>
          <Icon className="size-5" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default StatCard;
