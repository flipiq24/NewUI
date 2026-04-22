import type { OutreachBucket } from "@/lib/iq/mockData";

interface AudienceCardProps {
  bucket: OutreachBucket;
  selected: boolean;
  onToggle: () => void;
}

export default function AudienceCard({ bucket, selected, onToggle }: AudienceCardProps) {
  return (
    <div
      className={`relative flex-1 min-w-0 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
        selected ? "border-orange-500 shadow-md" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onToggle}
    >
      <div className={`px-3 py-2 ${bucket.headerColor}`}>
        <span className="text-xs font-bold text-white">{bucket.label}</span>
      </div>
      <div className="p-3 bg-white">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] text-gray-500">Total in DB</p>
            <p className="text-lg font-bold text-gray-900">{bucket.totalDB}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-500">Pending Today</p>
            <p className="text-lg font-bold text-orange-500">{bucket.pendingToday}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-2 space-y-1">
          <p className="text-[10px] text-gray-400">
            <span className="font-medium text-gray-600">Last Created:</span> {bucket.lastCreated}
          </p>
          <p className="text-[10px] text-gray-400 truncate">
            <span className="font-medium text-gray-600">Last Template:</span> {bucket.lastTemplate}
          </p>
        </div>
      </div>
      <div className={`absolute top-2 right-2 w-4 h-4 rounded border-2 flex items-center justify-center ${
        selected ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300"
      }`}>
        {selected && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1.5,5 4,7.5 8.5,2" />
          </svg>
        )}
      </div>
    </div>
  );
}
