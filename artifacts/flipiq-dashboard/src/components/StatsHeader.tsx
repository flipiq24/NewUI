import { RefreshCw, ChevronDown, Calendar, Globe } from "lucide-react";

export default function StatsHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800">My Stats</h1>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md px-3 py-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
        <button className="flex items-center gap-1 text-xs text-gray-600 border border-gray-200 rounded-md px-3 py-1.5">
          <span>Today</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-md px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Apr 14, 2026</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 max-w-[200px] truncate">
          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Pacific Time (Los Angeles) — ...</span>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}
