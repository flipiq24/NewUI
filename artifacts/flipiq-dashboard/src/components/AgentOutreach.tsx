import { Info } from "lucide-react";

function OutreachRow({
  label,
  value,
  pct,
  icon,
}: {
  label: string;
  value: number;
  pct: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-xs text-gray-700">{label}</span>
        <Info className="w-3 h-3 text-gray-300" />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-800 w-3 text-right">{value}</span>
        <span className="text-[10px] text-green-600 w-8">{pct}</span>
        <div className="w-24 h-1.5 bg-gray-100 rounded-full">
          <div className="h-full bg-orange-400 rounded-full" style={{ width: 0 }} />
        </div>
      </div>
    </div>
  );
}

export default function AgentOutreach() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-800 uppercase">Agent Outreach for Josh Santos</span>
        <Info className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div>
        <OutreachRow label="Texts" value={0} pct="+0%" icon={<TextIcon />} />
        <OutreachRow label="Emails" value={0} pct="+0%" icon={<EmailIcon />} />
        <OutreachRow label="Calls" value={0} pct="+0%" icon={<CallIcon />} />
        <OutreachRow label="New Relationships" value={0} pct="+0%" icon={<RelIcon />} />
        <OutreachRow label="Rel. Upgraded" value={0} pct="+0%" icon={<UpgradeIcon />} />
      </div>
    </div>
  );
}

function TextIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-3 3V3a1 1 0 011-1z"/>
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="12" height="9" rx="1"/>
      <polyline points="2,4 8,9 14,4"/>
    </svg>
  );
}
function CallIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z"/>
    </svg>
  );
}
function RelIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="11" cy="10" r="2"/>
      <line x1="8.5" y1="7.5" x2="9.5" y2="8.5"/>
    </svg>
  );
}
function UpgradeIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="4,10 8,5 12,10"/>
      <line x1="8" y1="5" x2="8" y2="14"/>
    </svg>
  );
}
