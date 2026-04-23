import type { DealProperty } from "@/lib/iq/mockData";
import { useDailyChecklist } from "@/lib/iq/dailyChecklist";

type PainLevel = "high" | "mid" | "low" | "none";
type AgentStatus = "responsive" | "not-responsive" | "none";
type KwLevel = "high" | "mid" | "low";

const PAIN_DOT: Record<PainLevel, string> = {
  high: "bg-red-500",
  mid: "bg-amber-500",
  low: "bg-gray-400",
  none: "bg-gray-300",
};
const PAIN_LABEL: Record<PainLevel, string> = {
  high: "High",
  mid: "Mid",
  low: "Low",
  none: "No data",
};

const AGENT_DOT: Record<AgentStatus, string> = {
  responsive: "bg-green-500",
  "not-responsive": "bg-red-500",
  none: "bg-gray-300",
};
const AGENT_LABEL: Record<AgentStatus, string> = {
  responsive: "Responsive",
  "not-responsive": "Not Responsive",
  none: "No contact yet",
};

const KW_DOT: Record<KwLevel, string> = {
  high: "bg-green-500",
  mid: "bg-amber-500",
  low: "bg-gray-400",
};
const KW_LABEL: Record<KwLevel, string> = {
  high: "High",
  mid: "Mid",
  low: "Low",
};

type StatusType = "neg" | "bu" | "init" | "none";

function statusType(label: string): StatusType {
  const l = label.toLowerCase();
  if (l.includes("negotiat")) return "neg";
  if (l.includes("back")) return "bu";
  if (l.includes("initial")) return "init";
  return "none";
}

const STATUS_PILL: Record<StatusType, string> = {
  neg: "bg-[#FAEEDA] text-[#854F0B] border border-[#FAC775]",
  bu: "bg-[#E6F1FB] text-[#185FA5] border border-[#B5D4F4]",
  init: "bg-[#EEEDFE] text-[#534AB7] border border-[#CECBF6]",
  none: "bg-gray-100 text-gray-500 border border-gray-200",
};

function painFromProperty(p: DealProperty): PainLevel {
  const s = p.propensityScore ?? 0;
  if (s >= 10) return "high";
  if (s >= 7) return "mid";
  if (s > 0) return "low";
  return "none";
}

function agentFromProperty(p: DealProperty): AgentStatus {
  const t = p.textResponse;
  const e = p.emailResponse;
  if (t === "positive" || e === "positive") return "responsive";
  if (t === "negative" || e === "negative" || t === "neutral") return "not-responsive";
  return "none";
}

function kwFromProperty(p: DealProperty): KwLevel {
  const r = p.id % 3;
  if (r === 0) return "high";
  if (r === 2) return "mid";
  return "low";
}

function arvPctFromProperty(p: DealProperty): number {
  // Deterministic placeholder ARV % until real ARV data is wired in.
  return 75 + ((p.id * 3) % 12);
}

function shortDate(d: string): string {
  if (!d || d === "N/A") return "—";
  const parts = d.split("/");
  return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : d;
}

export default function DealCard({ property }: { property: DealProperty }) {
  const { done, toggle } = useDailyChecklist(property.id);
  const pain = painFromProperty(property);
  const agent = agentFromProperty(property);
  const kw = kwFromProperty(property);
  const arvPct = arvPctFromProperty(property);
  const sType = statusType(property.offerLabel);
  const allDone = done.call;

  return (
    <div className="grid grid-cols-[16px_1fr_auto] gap-4 px-2 py-3 border-b border-gray-100 last:border-b-0 hover:bg-[#FAFAF9] transition-colors">
      {/* Left nav */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <input
          type="checkbox"
          checked={allDone}
          onChange={() => toggle("call")}
          className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
          title="Mark this deal complete"
        />
        <button
          type="button"
          title="More actions"
          className="text-gray-400 hover:text-gray-700 cursor-pointer leading-none"
        >
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.4" />
            <circle cx="8" cy="8" r="1.4" />
            <circle cx="8" cy="13" r="1.4" />
          </svg>
        </button>
        <button
          type="button"
          title="View conversations"
          className="text-gray-400 hover:text-gray-700 cursor-pointer mt-1"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 2v-2H3a1 1 0 01-1-1V4z" />
          </svg>
        </button>
      </div>

      {/* Main */}
      <div className="min-w-0">
        {/* Row 1 — phone + task */}
        <div className="flex items-center gap-2.5 mb-1">
          <button
            type="button"
            onClick={() => toggle("call")}
            title="Call"
            className="w-[22px] h-[22px] rounded-full bg-orange-50 border border-orange-300 flex items-center justify-center flex-shrink-0 hover:bg-orange-100 cursor-pointer"
          >
            <svg className="w-3 h-3 text-orange-500" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" />
            </svg>
          </button>
          <span
            className="text-[15px] font-medium text-gray-900 leading-snug truncate cursor-help"
            title={`Task: ${property.nextSteps}`}
          >
            {property.nextSteps}
          </span>
        </div>

        {/* Row 2 — address line */}
        <div className="flex items-center gap-2 text-[13px] text-gray-700 leading-6">
          <span
            className="truncate cursor-help"
            title={`Property — ${property.propertyType} · ${property.beds}/${property.baths} · ${property.sqft} · Built ${property.year} · DOM ${property.dom}/${property.cdom}`}
          >
            {property.address}
          </span>
          <button
            type="button"
            title="Open property"
            className="text-gray-400 hover:text-gray-700 flex-shrink-0 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13" />
            </svg>
          </button>
          <span className="text-gray-300">·</span>
          <span className="font-medium text-gray-900 cursor-help" title="Price">
            {property.price}
          </span>
          <span className="text-gray-300">·</span>
          <span className="font-medium text-gray-900 cursor-help" title="ARV %">
            {arvPct}% ARV
          </span>
        </div>

        {/* Row 3 — meta */}
        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[12px] text-gray-500 leading-5 mt-1">
          <span className="inline-flex items-center gap-1.5 cursor-help" title="Seller pain signals">
            <span className={`w-1.5 h-1.5 rounded-full ${PAIN_DOT[pain]}`} />
            Pain: {PAIN_LABEL[pain]}
          </span>
          <span className="text-gray-300">·</span>
          <span className="inline-flex items-center gap-1.5 cursor-help" title="Last attempts">
            <span className={`w-1.5 h-1.5 rounded-full ${AGENT_DOT[agent]}`} />
            Agent: {AGENT_LABEL[agent]}
          </span>
          <span className="text-gray-300">·</span>
          <span className="inline-flex items-center gap-1.5 cursor-help" title="Listing keywords">
            <span className={`w-1.5 h-1.5 rounded-full ${KW_DOT[kw]}`} />
            Keywords: {KW_LABEL[kw]}
          </span>
          <span className="text-gray-300">·</span>
          <span className="cursor-help" title={`First opened ${property.lastOpenDate}`}>
            Opened <span className="font-medium text-gray-700">{shortDate(property.lastOpenDate)}</span>
          </span>
          <span className="text-gray-300">·</span>
          <span className="cursor-help" title={`Last call ${property.lastCalledDate}`}>
            Called <span className="font-medium text-gray-700">{shortDate(property.lastCalledDate)}</span>
          </span>
        </div>
      </div>

      {/* Status chip */}
      <div className="flex items-start pt-1">
        <button
          type="button"
          title={`Offer Status — Stage: ${property.offerLabel} · Source: ${property.source} · Negotiator: ${property.negotiator}`}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold cursor-pointer ${STATUS_PILL[sType]}`}
        >
          <span>{property.offerPct}%</span>
          <span>{property.offerLabel}</span>
          <svg className="w-2.5 h-2.5 opacity-70" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="3,5 6,8 9,5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
