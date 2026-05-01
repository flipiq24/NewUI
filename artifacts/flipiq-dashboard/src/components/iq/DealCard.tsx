import { useState, useEffect, useRef, type ReactNode } from "react";
import type { DealProperty, ResponseStatus } from "@/lib/iq/mockData";
import { useDailyChecklist } from "@/lib/iq/dailyChecklist";
import { DEAL_DETAILS, type DealDetail, type CommLog } from "@/lib/iq/dealDetails";

const RESPONSE_DOT: Record<ResponseStatus, string> = {
  positive: "bg-[#639922]",
  neutral: "bg-[#B4B2A9]",
  negative: "bg-[#E24B4A]",
};
const RESPONSE_LABEL: Record<ResponseStatus, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

const PAIN_DOT: Record<DealDetail["pain"], string> = {
  high: "bg-[#E24B4A]",
  mid: "bg-[#BA7517]",
  low: "bg-[#B4B2A9]",
  none: "bg-[#B4B2A9]",
};
const PAIN_TEXT: Record<DealDetail["pain"], string> = {
  high: "text-[#E24B4A]",
  mid: "text-[#BA7517]",
  low: "text-[#B4B2A9]",
  none: "text-[#B4B2A9]",
};

/**
 * Recency tint for the Opened / Called timestamps on the right of the card.
 * Green = recent (≤3 days), yellow = getting stale (4–7 days),
 * red = cold or never (>7 days, "—", "N/A").
 */
const FRESHNESS: Record<"fresh" | "stale" | "cold", string> = {
  fresh: "text-[#476B14]",
  stale: "text-[#8B6210]",
  cold:  "text-[#A33232]",
};

/** Grade an "MM/DD" or "MM/DD/YY" string against today. */
function gradeFreshness(mmdd: string): keyof typeof FRESHNESS {
  if (!mmdd || mmdd === "—" || /n\/?a/i.test(mmdd)) return "cold";
  const m = mmdd.match(/^(\d{1,2})\/(\d{1,2})/);
  if (!m) return "cold";
  const today = new Date();
  const month = Number(m[1]);
  const day = Number(m[2]);
  // MM/DD has no year — assume current year, roll back if month is in the future.
  let year = today.getFullYear();
  if (month > today.getMonth() + 1) year -= 1;
  const then = new Date(year, month - 1, day);
  const days = Math.floor((today.getTime() - then.getTime()) / 86_400_000);
  if (days < 0) return "fresh";
  if (days <= 3) return "fresh";
  if (days <= 7) return "stale";
  return "cold";
}

/**
 * "$525,000" → "525k", "$1,250,000" → "1.25m", "$335,800" → "336k".
 * Used in the meta row where the dollar sign is dropped and zeros are
 * collapsed for scannability.
 */
function compactPrice(raw: string): string {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return raw;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2).replace(/\.?0+$/, "")}m`;
  }
  return `${Math.round(n / 1000)}k`;
}
const AGENT_DOT: Record<DealDetail["agent"], string> = {
  responsive: "bg-[#639922]",
  "not-responsive": "bg-[#E24B4A]",
  none: "bg-[#B4B2A9]",
};
const KW_DOT: Record<DealDetail["kw"], string> = {
  high: "bg-[#E24B4A]",
  mid:  "bg-[#BA7517]",
  low:  "bg-[#B4B2A9]",
};
/**
 * Label color for "Keywords: High / Mid / Low" so the WORD itself reflects
 * the heat — high deserves the same urgency as Pain. Mirrors PAIN_TEXT.
 */
const KW_TEXT: Record<DealDetail["kw"], string> = {
  high: "text-[#E24B4A] font-semibold",
  mid:  "text-[#BA7517]",
  low:  "text-[#B4B2A9]",
};
const SALES_TYPE_LABELS: Record<string, string> = {
  STD: "Standard",
  SPAY: "Short Sale",
  NOD: "Notice Of Default",
  REO: "REO",
  PRO: "Probate Listing",
  AUC: "Auction",
  TRUS: "Trust",
  TPA: "Third Party Approval",
  HUD: "HUD Owned",
  BK: "Bankruptcy Property",
  FORC: "In Foreclosure",
  CONS: "Conservatorship",
};
const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active:               { bg: "#EAF3DE", text: "#27500A", dot: "#5C9A2A" },
  pending:              { bg: "#FAEEDA", text: "#854F0B", dot: "#C58323" },
  "back up offer":      { bg: "#E6F1FB", text: "#185FA5", dot: "#2F86D6" },
  hold:                 { bg: "#EEEDFE", text: "#534AB7", dot: "#7A6FE0" },
  closed:               { bg: "#F1EFE8", text: "#2C2C2A", dot: "#5A5A56" },
  expired:              { bg: "#FCEBEB", text: "#791F1F", dot: "#B83A3A" },
  cancelled:            { bg: "#FCEBEB", text: "#A32D2D", dot: "#D45656" },
  "notification opened":{ bg: "#FFF7ED", text: "#9A3412", dot: "#D67432" },
  "off market":         { bg: "#F4F2EE", text: "#4B5563", dot: "#9CA3AF" },
};

function sourceKey(source: string, status: string) {
  const s = (status || source.replace(/^MLS\s*—\s*/i, "")).trim().toLowerCase();
  return s in SOURCE_COLORS ? s : source.trim().toLowerCase();
}
function sourceTextColor(source: string, status: string): string {
  const c = SOURCE_COLORS[sourceKey(source, status)] ?? SOURCE_COLORS["off market"];
  return c.text;
}

const STATUS_PILL: Record<DealDetail["statusType"], string> = {
  neg: "text-gray-700",
  bu: "text-gray-700",
  init: "text-gray-700",
  none: "text-gray-700",
};

function fallbackDetail(p: DealProperty): DealDetail {
  return {
    taskNote: p.nextSteps,
    prop: [["Type", `${p.propertyType} · ${p.type}`], ["Beds / Baths", `${p.beds} / ${p.baths}`]],
    arv: "—", arvPct: "—",
    priceHist: [["Original list", p.price]], priceTotal: "—",
    pain: "none", painLabel: "No data", painSig: [],
    agent: "none", agentLabel: "No contact yet", agentComms: [], agentRate: "—",
    kw: "low", kwLabel: "Low", pubCmt: "—", agtCmt: "—",
    opened: p.lastOpenDate, called: p.lastCalledDate,
    firstOpened: p.lastOpenDate, totalOpens: 0,
    firstCalled: p.lastCalledDate, totalCommsCount: 0, totalCalls: 0, totalTexts: 0, totalEmails: 0,
    pct: `${p.offerPct}%`, status: p.offerLabel,
    statusType: p.offerLabel.toLowerCase().includes("negotiat") ? "neg" : p.offerLabel.toLowerCase().includes("back") ? "bu" : p.offerLabel.toLowerCase().includes("initial") ? "init" : "none",
    source: `${p.source} — ${p.sourceStatus}`, negotiator: p.negotiator, assigned: p.assignedUser,
  };
}

function TipPanel({
  title,
  rows,
  total,
  align = "left",
  wide = false,
  children,
}: {
  title: string;
  rows?: [string, string][];
  total?: string;
  align?: "left" | "right";
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1.5 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-left ${
        wide ? "min-w-[330px] max-w-[400px]" : "min-w-[240px] max-w-[300px]"
      } ${align === "right" ? "right-0" : "left-0"}`}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-orange-600 mb-1.5">
        {title}
      </div>
      {rows?.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3.5 py-[1.5px] text-[12px]">
          <span className="text-gray-400">{k}</span>
          <span className="text-gray-900 font-medium">{v}</span>
        </div>
      ))}
      {total && (
        <div className="flex justify-between gap-3.5 mt-1.5 pt-1.5 border-t border-gray-200 text-[12px]">
          <span className="text-gray-400">Total reduction</span>
          <span className="text-gray-900 font-medium">{total}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function KwHtml({ html }: { html: string }) {
  // Renders pubCmt/agtCmt with <span class="kw">…</span> styled as red pills.
  const parts = html.split(/(<span class="kw">.*?<\/span>)/g);
  return (
    <p className="text-[12px] text-gray-900 leading-snug m-0">
      {parts.map((part, i) => {
        const m = part.match(/^<span class="kw">(.*?)<\/span>$/);
        if (m) {
          return (
            <span
              key={i}
              className="inline-block bg-red-500 text-white px-1.5 py-px rounded font-medium text-[10.5px] tracking-wide mx-0.5"
            >
              {m[1]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

const ICON = {
  kebab: <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><circle cx="8" cy="3" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="8" cy="13" r="1.4" /></svg>,
  chat: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 2v-2H3a1 1 0 01-1-1V4z" /></svg>,
  globe: <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3 h-3"><circle cx="6" cy="6" r="5" /><line x1="1" y1="6" x2="11" y2="6" /><path d="M6 1c1.5 1.5 1.5 8.5 0 10M6 1c-1.5 1.5-1.5 8.5 0 10" /></svg>,
  phone: <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" /></svg>,
  caret: <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-2.5 h-2.5 opacity-70"><polyline points="3,5 6,8 9,5" /></svg>,
  chPhone: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 2.5h2.5l1.2 3-1.5 1A8 8 0 0010.5 11l1-1.5 3 1.2v2.5a1 1 0 01-1 1C7 14.2 1.8 9 1.8 3.5a1 1 0 011-1z" /></svg>,
  chText: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" /></svg>,
  chMail: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><rect x="2" y="3.5" width="12" height="9" rx="1" /><polyline points="2.5,4.5 8,9 13.5,4.5" strokeLinecap="round" /></svg>,
};

/**
 * Channel preview rendered inside the chip's hover tooltip.
 * Shows the last outbound message we sent and the last inbound reply,
 * so the rep can scan thread state without opening the modal.
 */
function ChannelPreview({ log }: { log?: CommLog }) {
  if (!log || (!log.lastSent && !log.lastReply)) {
    return (
      <div className="text-[12px] text-gray-500 italic">
        No messages yet on this channel.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {log.lastSent && (
        <div>
          <div className="flex justify-between gap-3 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            <span>Last sent</span><span>{log.lastSent.ts}</span>
          </div>
          <div className="text-[12px] text-gray-900 leading-snug mt-0.5">
            {log.lastSent.body}
          </div>
        </div>
      )}
      {log.lastReply && (
        <div>
          <div className="flex justify-between gap-3 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            <span>Last reply</span><span>{log.lastReply.ts}</span>
          </div>
          <div className="text-[12px] text-gray-900 leading-snug mt-0.5">
            {log.lastReply.body}
          </div>
        </div>
      )}
      <div className="pt-1.5 border-t border-gray-200 text-[10px] uppercase tracking-wider text-orange-600 font-semibold">
        Click to open communication →
      </div>
    </div>
  );
}

type ChannelKey = "call" | "text" | "email";

function ChannelChips({
  property,
  detail,
  onOpenComm,
}: {
  property: DealProperty;
  detail: DealDetail;
  onOpenComm: (channel: ChannelKey) => void;
}) {
  const channels: { key: ChannelKey; icon: ReactNode; label: string; status: ResponseStatus }[] = [];
  if (property.callResponse)  channels.push({ key: "call",  icon: ICON.chPhone, label: "Call",  status: property.callResponse });
  if (property.textResponse)  channels.push({ key: "text",  icon: ICON.chText,  label: "Text",  status: property.textResponse });
  if (property.emailResponse) channels.push({ key: "email", icon: ICON.chMail,  label: "Email", status: property.emailResponse });
  if (channels.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-2.5">
      {channels.map((c) => (
        <span key={c.key} className="relative group inline-flex items-center">
          <button
            type="button"
            onClick={() => onOpenComm(c.key)}
            className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 cursor-pointer"
            aria-label={`Open ${c.label} thread`}
          >
            {c.icon}
            <span className={`w-1.5 h-1.5 rounded-full ${RESPONSE_DOT[c.status]}`} />
          </button>
          <TipPanel title={`${c.label} — ${RESPONSE_LABEL[c.status]}`} wide>
            <ChannelPreview log={detail.commLog?.[c.key]} />
          </TipPanel>
        </span>
      ))}
    </span>
  );
}

const COMM_LABEL: Record<ChannelKey, string> = { call: "Call", text: "Text", email: "Email" };

/**
 * Modal that opens when a chip is clicked. Shows the most recent
 * outbound + inbound for the selected channel and a no-op composer.
 * Closes on overlay click, Escape, or the X button.
 */
function CommunicationDialog({
  open,
  channel,
  detail,
  property,
  onClose,
}: {
  open: boolean;
  channel: ChannelKey | null;
  detail: DealDetail;
  property: DealProperty;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !channel) return null;
  const log = detail.commLog?.[channel];
  const placeholder =
    channel === "call"  ? "Log a quick call note…"
  : channel === "text"  ? "Type your text message…"
                        : "Compose your email…";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-orange-600 font-semibold">
              {COMM_LABEL[channel]} thread
            </div>
            <div className="text-[13px] text-gray-900 font-medium mt-0.5">
              {property.address}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none cursor-pointer"
            aria-label="Close"
          >×</button>
        </div>
        <div className="px-4 py-3 max-h-[50vh] overflow-y-auto space-y-3">
          {log?.lastSent && (
            <div className="flex flex-col items-end">
              <div className="max-w-[80%] bg-orange-50 border border-orange-200 text-gray-900 text-[13px] rounded-lg px-3 py-2">
                {log.lastSent.body}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                You · {log.lastSent.ts}
              </div>
            </div>
          )}
          {log?.lastReply && (
            <div className="flex flex-col items-start">
              <div className="max-w-[80%] bg-gray-100 border border-gray-200 text-gray-900 text-[13px] rounded-lg px-3 py-2">
                {log.lastReply.body}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {detail.taskWho ?? "Agent"} · {log.lastReply.ts}
              </div>
            </div>
          )}
          {!log?.lastSent && !log?.lastReply && (
            <div className="text-[12px] text-gray-500 italic text-center py-6">
              No {COMM_LABEL[channel].toLowerCase()} history yet.
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <textarea
            placeholder={placeholder}
            className="w-full text-[13px] border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={2}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[12px] px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer"
            >Cancel</button>
            <button
              type="button"
              onClick={onClose}
              className="text-[12px] px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 cursor-pointer"
            >Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const MENU_ITEMS = {
  comm: ["Call", "Text", "Email", "Text Voicemail", "AI Connect"],
  quick: ["Notes", "Tax Data", "Activities", "Create Reminder", "AI Report"],
  detail: ["PIQ", "Comps", "Investment Analysis", "Offer Terms", "Agent"],
};

function DrillMenu({
  open,
  onClose,
  onCall,
}: {
  open: boolean;
  onClose: () => void;
  onCall: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="absolute top-0 left-[calc(100%+8px)] bg-white border border-gray-300 rounded-lg shadow-lg p-2.5 z-50 min-w-[600px] grid grid-cols-3 gap-x-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div>
        <h5 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-1.5 mb-1">Communication</h5>
        {MENU_ITEMS.comm.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              if (label === "Call") {
                onCall();
                onClose();
              }
            }}
            className="w-full text-left px-2 py-1.5 text-[13px] text-gray-900 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap"
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        <h5 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-1.5 mb-1">Quick Links</h5>
        {MENU_ITEMS.quick.map((label) => (
          <button key={label} type="button" className="w-full text-left px-2 py-1.5 text-[13px] text-gray-900 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap">
            {label}
          </button>
        ))}
      </div>
      <div>
        <h5 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-1.5 mb-1">Detailed Analysis</h5>
        {MENU_ITEMS.detail.map((label) => (
          <button key={label} type="button" className="w-full text-left px-2 py-1.5 text-[13px] text-gray-900 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap">
            {label}
          </button>
        ))}
      </div>
      <div className="col-span-3 mt-1.5 pt-2 border-t border-gray-200">
        <button type="button" className="w-full text-left px-2 py-1.5 text-[13px] font-semibold text-orange-700 hover:bg-orange-50 rounded cursor-pointer">
          Auto Tracker
        </button>
      </div>
    </div>
  );
}

export default function DealCard({ property }: { property: DealProperty }) {
  const { done, toggle } = useDailyChecklist(property.id);
  const detail = DEAL_DETAILS[property.id] ?? fallbackDetail(property);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  /**
   * Which channel modal is open, if any. Set by the chip click handler;
   * `null` keeps the dialog hidden.
   */
  const [commChannel, setCommChannel] = useState<ChannelKey | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  const triggerCall = () => {
    setMenuOpen(false);
    setNudgeOpen(true);
  };

  return (
    <div ref={rowRef} className={`grid grid-cols-[16px_1fr_auto] gap-4 px-2 py-3 border-b border-gray-100 last:border-b-0 hover:bg-[#FAFAF9] transition-colors relative ${done.call ? "opacity-60" : ""}`}>
      {/* Left rail */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <input
          type="checkbox"
          checked={done.call}
          onChange={() => toggle("call")}
          className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
        />
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="text-gray-400 hover:text-gray-700 cursor-pointer leading-none"
          >
            {ICON.kebab}
          </button>
          <DrillMenu open={menuOpen} onClose={() => setMenuOpen(false)} onCall={triggerCall} />
        </div>
        {/* Chat icon — sits directly under the 3-dots kebab in the left rail. */}
        <div className="relative group">
          <button type="button" className="text-gray-400 hover:text-gray-700 cursor-pointer">
            {ICON.chat}
          </button>
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1.5 left-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg px-2.5 py-1.5 text-[12px] text-gray-900 whitespace-nowrap">
            View conversations
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="min-w-0">
        {/* Row 1 — Call CTA + channel chips next to it + next step */}
        <div className="flex items-center gap-2.5 mb-1">
          <button
            type="button"
            onClick={triggerCall}
            title={done.call ? "Call logged" : "Call this agent first"}
            className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${
              done.call
                ? "bg-white border-[1.5px] border-orange-500 text-orange-600"
                : "bg-orange-50 border border-orange-300 text-orange-600 hover:bg-orange-500 hover:text-white ring-2 ring-orange-300 shadow-[0_0_0_3px_rgba(251,146,60,0.35)] animate-pulse"
            }`}
          >
            {done.call ? (
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,8 7,12 13,4" />
              </svg>
            ) : (
              ICON.phone
            )}
          </button>
          {/* Pain level (HIGH / MID / LOW) — sits between the phone icon
              and the next-step CTA so the rep sees seller motivation FIRST. */}
          {detail.pain !== "none" && (
            <span className="relative group cursor-help shrink-0">
              <span className={`text-[12px] font-semibold uppercase tracking-wide ${PAIN_TEXT[detail.pain]}`}>
                {detail.painLabel}
              </span>
              <TipPanel title="Seller Pain" rows={detail.painSig} />
            </span>
          )}
          <span className="relative group cursor-help">
            <span className={`text-[15px] font-semibold leading-snug ${done.call ? "text-gray-400 line-through" : "text-orange-600 group-hover:text-orange-700"}`}>
              {property.nextSteps}
            </span>
            <TipPanel
              title="Next Step"
              wide
              rows={[
                ["Task", property.nextSteps],
                ...(detail.taskWho ? ([["Who", detail.taskWho]] as [string, string][]) : []),
                ...(detail.taskWhat ? ([["What", detail.taskWhat]] as [string, string][]) : []),
                ...(detail.taskHow ? ([["How", detail.taskHow]] as [string, string][]) : []),
                ["Context", detail.taskNote],
              ]}
            />
          </span>
          {/* Channel chips after the next-step response */}
          <ChannelChips
            property={property}
            detail={detail}
            onOpenComm={setCommChannel}
          />
          {/* Plain inline flags (no box, no pill) */}
          {property.notifications?.includes("critical") && (
            <span className="text-[12px] font-semibold text-[#E24B4A]">Critical</span>
          )}
          {property.notifications?.includes("reminder") && (
            <span className="text-[12px] font-semibold text-[#2F86D6]">Reminder</span>
          )}
        </div>

        {/* Line 2 — property (asset facts + deal math). flex-nowrap + min-w-0 +
            truncating address keep this on EXACTLY one visual line. */}
        <div className="flex items-center flex-nowrap min-w-0 gap-x-2 text-[13px] text-gray-700 leading-6 whitespace-nowrap">
          <span className="relative group cursor-help min-w-0 truncate">
            <span className="group-hover:text-gray-900">{property.address}</span>
            <TipPanel title="Property" rows={detail.prop} />
          </span>
          <button type="button" className="shrink-0 text-gray-400 hover:text-orange-500 cursor-pointer">
            {ICON.globe}
          </button>
          <span className="shrink-0 text-gray-300">·</span>
          <span className="shrink-0 relative group cursor-help text-gray-700 font-medium hover:text-gray-900">
            {property.type}
            <TipPanel
              title="Sales Type"
              rows={[
                ["Sales Type", `${property.type} — ${SALES_TYPE_LABELS[property.type.toUpperCase()] ?? property.type}`],
                ["Property Type", property.propertyType],
              ]}
            />
          </span>
          <span className="shrink-0 text-gray-300">·</span>
          {/* Keywords — right after sales type (it's property data).
              Label color mirrors the dot via KW_TEXT — high = red,
              mid = amber, low = gray. */}
          <span className="shrink-0 relative group cursor-help inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900">
            <span className={`w-1.5 h-1.5 rounded-full ${KW_DOT[detail.kw]}`} />
            <span className={KW_TEXT[detail.kw]}>Keywords: {detail.kwLabel}</span>
            <TipPanel title="Listing Remarks" wide>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-1.5 mb-1">Public Comments</div>
              <KwHtml html={detail.pubCmt} />
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-2 mb-1">Agent Comments</div>
              <KwHtml html={detail.agtCmt} />
            </TipPanel>
          </span>
          <span className="shrink-0 text-gray-300">·</span>
          <span className="shrink-0 relative group cursor-help text-gray-500 hover:text-gray-900">
            Source:{" "}
            <span className="text-gray-700 font-medium">
              {property.source.replace(/\s*—\s*.*$/, "")}
              {property.sourceStatus || /\s*—\s*/.test(property.source) ? " — " : ""}
            </span>
            <span
              className="font-medium"
              style={{ color: sourceTextColor(property.source, property.sourceStatus) }}
            >
              {property.sourceStatus || (property.source.match(/\s*—\s*(.*)$/)?.[1] ?? "")}
            </span>
            <TipPanel
              title="Source"
              rows={[
                ["Source", property.source],
                ...(property.sourceStatus ? ([["Status", property.sourceStatus]] as [string, string][]) : []),
                ["Negotiator", detail.negotiator],
                ["Assigned", detail.assigned],
              ]}
            />
          </span>
        </div>

        {/* Line 3 — deal math (compact price + ARV) + Pain + agent.
            Price moved here, no "$" prefix, zeros collapsed (525k).
            Pain shows as ● Pain: Mid right after ARV (the Row 1 chip is the
            at-a-glance signal; this row is the inline data label). */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[13px] text-gray-700 leading-6">
          <span className="relative group cursor-help font-semibold text-gray-900">
            {compactPrice(property.price)}
            <TipPanel title="Price History" rows={detail.priceHist} total={detail.priceTotal} />
          </span>
          <span className="text-gray-300">·</span>
          <span className="relative group cursor-help font-medium text-gray-700">
            {detail.arvPct}
            <TipPanel title="ARV" rows={[["Asking", property.price], ["ARV", detail.arv], ["Asking vs ARV", detail.arvPct]]} />
          </span>
          <span className="text-gray-300">·</span>
          <span className="relative group cursor-help inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900">
            <span className={`w-1.5 h-1.5 rounded-full ${PAIN_DOT[detail.pain]}`} />
            Pain: {detail.painLabel}
            <TipPanel title="Seller Pain" rows={detail.painSig} />
          </span>
          <span className="text-gray-300">·</span>
          <span className="relative group cursor-help inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900">
            <span className={`w-1.5 h-1.5 rounded-full ${AGENT_DOT[detail.agent]}`} />
            Agent: {detail.agentLabel}
            <TipPanel title="Last Attempts" rows={detail.agentComms}>
              <div className="flex justify-between gap-3.5 mt-1.5 pt-1.5 border-t border-gray-200 text-[12px]">
                <span className="text-gray-400">Response rate</span>
                <span className="text-gray-900 font-medium">{detail.agentRate}</span>
              </div>
            </TipPanel>
          </span>
          <span className="text-gray-300">·</span>
          {/* ISC — Investor Sourced Count.
              0 = colorless gray (agent has never sourced a deal — nothing to
              click into). Any positive count renders the number in the
              hyperlink blue (#2F86D6) to signal it's drillable history. */}
          <span className="relative group cursor-help inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-900">
            <span>
              ISC:{" "}
              <span
                className={
                  (detail.isc ?? 19) > 0
                    ? "font-medium text-[#2F86D6]"
                    : "font-medium text-gray-400"
                }
              >
                {detail.isc ?? 19}
              </span>
            </span>
            <TipPanel
              title="Investor Sourced Count"
              rows={[
                ["ISC", String(detail.isc ?? 19)],
                ["Meaning", "Number of deals this agent has sourced to investors."],
              ]}
            />
          </span>
          <span className="text-gray-300">·</span>
          <span className="relative group cursor-help inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-900">
            {/* Active count is highlighted orange whenever > 0 — open deals are
                the only piece of this row that needs immediate attention. */}
            <span className="font-medium text-gray-700 tabular-nums">
              <span className={(detail.trackActive ?? 7) > 0 ? "text-[#D67432] font-semibold" : ""}>
                {detail.trackActive ?? 7}A
              </span>
              {" / "}{detail.trackPending ?? 3}P / {detail.trackBackup ?? 0}B / {detail.trackSold ?? 54}S
            </span>
            <TipPanel
              title="Deal Track Record"
              rows={[
                ["Active",  String(detail.trackActive  ?? 7)],
                ["Pending", String(detail.trackPending ?? 3)],
                ["Backup",  String(detail.trackBackup  ?? 0)],
                ["Sold",    String(detail.trackSold    ?? 54)],
                ["Total",   String(detail.trackTotal   ?? 57)],
              ]}
            />
          </span>
        </div>

        {/* Post-call nudge */}
        {nudgeOpen && (
          <div className="mt-2.5 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md flex items-center justify-between gap-2.5 flex-wrap text-[12.5px] text-orange-900">
            <span>✓ Call logged. <span className="font-medium">Send text + email follow-up?</span></span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setNudgeOpen(false)}
                className="px-2.5 py-1 bg-gray-900 text-white rounded text-[11.5px] font-medium cursor-pointer hover:bg-gray-800"
              >
                Yes, send both
              </button>
              <button
                type="button"
                onClick={() => setNudgeOpen(false)}
                className="px-2.5 py-1 bg-transparent text-gray-600 border border-gray-300 rounded text-[11.5px] cursor-pointer hover:bg-gray-50"
              >
                Not yet
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status + recency (last touched) */}
      <div className="flex flex-col items-end pt-1 gap-0.5 whitespace-nowrap">
        <span className={`relative group cursor-pointer inline-flex items-center gap-1 text-[12px] font-medium hover:text-gray-900 ${STATUS_PILL[detail.statusType]}`}>
          <span className="font-semibold">{detail.pct}</span>
          <span>{detail.status}</span>
          {ICON.caret}
          <TipPanel
            title="Offer Status"
            align="right"
            rows={[
              ["Completion", detail.pct],
              ["Stage", detail.status],
              ["Source", detail.source],
              ["Negotiator", detail.negotiator],
              ["Assigned", detail.assigned],
            ]}
          />
        </span>
        <div className="inline-flex items-center gap-1.5 text-[11.5px] text-gray-500">
          {/* Plain colored text — green = ≤3d, yellow = 4–7d, red = cold/never. No pills, no boxes. */}
          <span className={`relative group cursor-help font-medium ${FRESHNESS[gradeFreshness(detail.opened)]}`}>
            Opened {detail.opened}
            <TipPanel
              title="Open History"
              align="right"
              rows={[["First opened", detail.firstOpened], ["Last opened", detail.opened], ["Total opens", String(detail.totalOpens)]]}
            />
          </span>
          <span className="text-gray-300">·</span>
          <span className={`relative group cursor-help font-medium ${FRESHNESS[gradeFreshness(detail.called)]}`}>
            Called {detail.called}
            <TipPanel
              title="Communication History"
              align="right"
              rows={[["First call", detail.firstCalled], ["Last call", detail.called], ["Total comms", String(detail.totalCommsCount)]]}
            >
              <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                <div className="flex justify-between gap-3.5 py-[1.5px] text-[12px]"><span className="text-gray-400">Calls</span><span className="text-gray-900 font-medium">{detail.totalCalls}</span></div>
                <div className="flex justify-between gap-3.5 py-[1.5px] text-[12px]"><span className="text-gray-400">Texts</span><span className="text-gray-900 font-medium">{detail.totalTexts}</span></div>
                <div className="flex justify-between gap-3.5 py-[1.5px] text-[12px]"><span className="text-gray-400">Emails</span><span className="text-gray-900 font-medium">{detail.totalEmails}</span></div>
              </div>
            </TipPanel>
          </span>
        </div>
      </div>
      <CommunicationDialog
        open={commChannel !== null}
        channel={commChannel}
        detail={detail}
        property={property}
        onClose={() => setCommChannel(null)}
      />
    </div>
  );
}
