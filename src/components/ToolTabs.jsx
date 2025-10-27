import { useMemo } from "react";
import { FileText, Table, BarChart3 } from "lucide-react";

export default function ToolTabs({ value, onChange }) {
  const tabs = useMemo(
    () => [
      {
        id: "csvjson",
        label: "CSV ⇄ JSON",
        icon: Table,
        desc: "Convert between CSV and JSON",
      },
      {
        id: "loganalyzer",
        label: "Log Analyzer",
        icon: BarChart3,
        desc: "Parse logs and summarize",
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        {tabs.map((t) => {
          const Icon = t.icon || FileText;
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`group flex items-start gap-3 rounded-xl border p-3 sm:p-4 text-left transition-all ${
                active
                  ? "border-blue-600 bg-blue-50/60"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`mt-0.5 rounded-lg p-2 ${
                  active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{t.label}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
