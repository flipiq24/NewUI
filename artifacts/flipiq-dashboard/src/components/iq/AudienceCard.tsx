import type { OutreachBucket } from "@/lib/iq/mockData";

interface AudienceCardProps {
  bucket: OutreachBucket;
  selected: boolean;
  onToggle: () => void;
}

export default function AudienceCard({ bucket, selected, onToggle }: AudienceCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`relative flex-1 min-w-0 bg-white border-t-4 ${bucket.topBorder} rounded border cursor-pointer transition-all ${
        selected ? "border-orange-400 shadow-sm" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Checkbox top-right */}
      <div className="absolute top-2.5 right-2.5">
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
            selected ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300"
          }`}
        >
          {selected && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1.5,5 4,7.5 8.5,2" />
            </svg>
          )}
        </div>
      </div>

      <div className="p-3 pt-2.5 pr-8">
        {/* Label */}
        <p className={`text-xs font-bold tracking-wide mb-1 ${bucket.labelColor}`}>{bucket.label}</p>

        {/* Total Database */}
        <p className="text-[11px] text-gray-500 mb-1.5">
          Total Database: <span className="text-blue-500 font-semibold">{bucket.totalDB}</span>
        </p>

        {/* Pending Today — large number */}
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className={`text-3xl font-black leading-none ${bucket.pendingColor}`}>{bucket.pendingToday}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">PENDING TODAY</span>
        </div>

        {/* SMS / Email pills */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 border border-gray-300 rounded px-1.5 py-0.5 bg-white">
            <SmsIcon />
            SMS
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-600 border border-gray-300 rounded px-1.5 py-0.5 bg-white">
            <MailIcon />
            Email
          </span>
        </div>

        {/* Last Created / Last Template */}
        <div className="space-y-0.5 text-[10px] text-gray-500">
          <div className="flex items-start gap-1">
            <span className="text-gray-400 font-medium flex-shrink-0">Last Created:</span>
            <span className="text-gray-600">{bucket.lastCreated}</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-gray-400 font-medium flex-shrink-0">Last Template:</span>
            <span className="text-gray-600 flex items-center gap-0.5">
              <DocIcon />
              <span className="truncate">{bucket.lastTemplate}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmsIcon() {
  return (
    <svg className="w-2.5 h-2.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="12" height="9" rx="1.5" />
      <path d="M4 13l2-3" strokeLinecap="round" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg className="w-2.5 h-2.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2.5" width="12" height="9" rx="1.5" />
      <polyline points="1,3.5 7,8.5 13,3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg className="w-2.5 h-2.5 flex-shrink-0 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="0.5" width="8" height="11" rx="1" />
      <line x1="4" y1="3.5" x2="8" y2="3.5" />
      <line x1="4" y1="5.5" x2="8" y2="5.5" />
      <line x1="4" y1="7.5" x2="6.5" y2="7.5" />
    </svg>
  );
}
