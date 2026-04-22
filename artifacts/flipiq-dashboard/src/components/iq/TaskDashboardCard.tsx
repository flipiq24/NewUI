import { ReactNode } from "react";

interface TaskDashboardCardProps {
  priority: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onStart: () => void;
}

export default function TaskDashboardCard({ priority, title, subtitle, children, onStart }: TaskDashboardCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 cursor-default">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-1">
            Priority #{priority}
          </p>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onStart}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          Start
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6,3 11,8 6,13" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
}
