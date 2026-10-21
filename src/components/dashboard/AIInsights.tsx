import { AlertCircle, CheckCircle2, Info, Sparkles } from "lucide-react";

import type { DashboardInsight, InsightTone } from "@/types/dashboard";

interface AIInsightsProps {
  insights: DashboardInsight[];
}

const toneConfig: Record<
  InsightTone,
  {
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  warning: {
    icon: AlertCircle,
    className: "bg-amber-50 text-amber-700",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 text-blue-700",
  },
};

function AIInsights({ insights }: AIInsightsProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-amber-500" />

        <h2 className="font-semibold text-slate-900">Smart Insights</h2>

        <span className="ml-auto rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
          Demo
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Sample recommendations based on restaurant operations.
      </p>

      <div className="mt-5 divide-y divide-slate-100">
        {insights.map((insight) => {
          const config = toneConfig[insight.tone];
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${config.className}`}
              >
                <Icon className="size-4" />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-800">
                  {insight.title}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AIInsights;
