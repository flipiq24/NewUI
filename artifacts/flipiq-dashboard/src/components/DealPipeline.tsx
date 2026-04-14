import { Info, Flame } from "lucide-react";

function PipelineRow({
  label,
  value,
  pct,
  indent = false,
  showBar = false,
  barColor = "bg-green-500",
  subRows,
  icon,
}: {
  label: string;
  value: string | number;
  pct?: string;
  indent?: boolean;
  showBar?: boolean;
  barColor?: string;
  subRows?: { label: string; value: string | number }[];
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className={`flex items-center justify-between py-2 ${indent ? "pl-4" : ""} border-b border-gray-100`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className={`text-xs text-gray-700 ${indent ? "text-gray-500" : ""}`}>{label}</span>
          <Info className="w-3 h-3 text-gray-300 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-800 w-4 text-right">{value}</span>
          {pct !== undefined && (
            <span className="text-[10px] text-green-600 w-8 text-right">{pct}</span>
          )}
          {showBar && (
            <div className="w-24 h-1.5 bg-gray-100 rounded-full">
              <div className={`h-full ${barColor} rounded-full`} style={{ width: Number(value) > 0 ? "40%" : "0%" }} />
            </div>
          )}
        </div>
      </div>
      {subRows && subRows.map((sub, i) => (
        <div key={i} className="flex items-center justify-between py-1 pl-8 border-b border-gray-50">
          <span className="text-[11px] text-gray-500">{sub.label}</span>
          <span className="text-[11px] text-gray-600">{sub.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DealPipeline() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-800 uppercase">Deal Pipeline for Josh Santos</span>
        <Info className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="px-0">
        {/* Opened New Deals */}
        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-1.5">
              <FolderSmIcon />
              <span className="text-xs text-gray-700">Opened New Deals</span>
              <Info className="w-3 h-3 text-gray-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-800">3</span>
              <span className="text-[10px] text-green-600">+0%</span>
            </div>
          </div>
          {/* Hot Deals sub-row */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-1 pl-4 pb-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="text-[11px] text-gray-600">Hot Deals</span>
              <div className="ml-auto flex items-center gap-4">
                <span className="text-[11px] text-gray-700">3</span>
              </div>
            </div>
            <div className="flex items-center gap-1 pl-8">
              <span className="text-[10px] text-gray-400">Agent Not Assigned</span>
              <div className="ml-auto">
                <span className="text-[11px] text-gray-700">3</span>
              </div>
            </div>
          </div>
        </div>

        <PipelineRow
          label="Reopened Deals"
          value={0}
          pct="+0%"
          icon={<FolderSmIcon />}
        />
        <PipelineRow
          label="Reopen / New Ratio"
          value={0}
          pct="+0%"
          showBar
          icon={<RatioIcon />}
        />
        <PipelineRow
          label="Texts"
          value={0}
          pct="+0%"
          showBar
          icon={<TextIcon />}
        />
        <PipelineRow
          label="Emails"
          value={0}
          pct="+0%"
          showBar
          icon={<EmailIcon />}
        />
        <PipelineRow
          label="Calls"
          value={0}
          pct="+0%"
          icon={<CallIcon />}
        />
        <PipelineRow
          label="Offers Sent"
          value={0}
          pct="+0%"
          icon={<OffersIcon />}
        />
        <PipelineRow
          label="In Negotiations"
          value={0}
          pct="+0%"
          icon={<NegotIcon />}
        />
        <PipelineRow
          label="Accepted"
          value={0}
          pct="+0%"
          icon={<AcceptIcon />}
        />
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-1.5">
            <AcqIcon />
            <span className="text-xs text-gray-700">Acquired</span>
            <Info className="w-3 h-3 text-gray-300" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-800">0</span>
            <span className="text-[10px] text-green-600">+0%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderSmIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/>
    </svg>
  );
}
function RatioIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="5" r="2"/>
      <circle cx="11" cy="11" r="2"/>
      <line x1="3" y1="13" x2="13" y2="3"/>
    </svg>
  );
}
function TextIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-3 3V3a1 1 0 011-1z"/>
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="12" height="9" rx="1"/>
      <polyline points="2,4 8,9 14,4"/>
    </svg>
  );
}
function CallIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z"/>
    </svg>
  );
}
function OffersIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1"/>
      <polyline points="5,7 8,10 11,7"/>
    </svg>
  );
}
function NegotIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-3 3V3a1 1 0 011-1z"/>
      <line x1="6" y1="6" x2="10" y2="6"/>
    </svg>
  );
}
function AcceptIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1"/>
      <polyline points="5,8 7.5,10.5 11,6"/>
    </svg>
  );
}
function AcqIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1"/>
      <path d="M6 8h4M8 6v4"/>
    </svg>
  );
}
