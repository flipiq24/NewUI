import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqAskBar from "@/components/iq/IqAskBar";
import { DEAL_REVIEW_PROPERTIES, type DealProperty } from "@/lib/iq/mockData";
import { DEAL_DETAILS, type DealDetail } from "@/lib/iq/dealDetails";
import {
  AGENT_DOT,
  FRESHNESS,
  gradeFreshness,
  PAIN_DOT,
  PAIN_TEXT,
  SALES_TYPE_LABELS,
  KW_TEXT,
  compactPrice,
  sourceTextColor,
  recommendedChannel,
  REC_COPY,
  type RecChannel,
} from "@/components/iq/DealCard";

/**
 * Property detail page — simplified, workflow-driven layout.
 *
 * - Header: address + globe + edit + "agent has N other listings" + status pill.
 *   Secondary tabs (Notes / Comms / Reminders / Activity / Tax) hidden behind
 *   icons on the right of the breadcrumb row (hover-revealed labels).
 * - Workflow tabs: PIQ → Comps → Investment Analysis → Agent → Offer Terms,
 *   shown as a numbered stepper with completion state.
 * - Metric cards: Simple / Detailed toggle. Simple mode shows just the
 *   headline number per card; Detailed shows everything.
 * - Body panels reuse the same channel-aware playbook + color tokens from
 *   DealCard so both surfaces stay in lockstep.
 */
export default function IqPropertyDetail() {
  const params = useParams<{ address: string }>();
  const decoded = decodeURIComponent(params.address ?? "");

  // Look up by exact address; fall back to the first deal so the page is
  // always navigable as a demo entry point (e.g. when visiting the literal
  // `:address` placeholder URL).
  const property = useMemo<DealProperty>(() => {
    const match = DEAL_REVIEW_PROPERTIES.find((p) => p.address === decoded);
    return match ?? DEAL_REVIEW_PROPERTIES[0];
  }, [decoded]);

  // Workflow stepper: PIQ → Comps → Investment Analysis → Agent → Offer Terms.
  // Steps with index < activeStep render checked/completed; activeStep is the
  // current orange pill; steps after are idle. Click any pill to jump.
  const [activeStep, setActiveStep] = useState(0);
  const detail: DealDetail = DEAL_DETAILS[property.id];

  const rec = recommendedChannel(detail);

  const propertyBasics = `${property.propertyType} / ${property.beds} Br / ${property.baths} Ba / ${property.garage} Gar / ${property.year} / ${property.sqft} / ${property.lotSqft} / Pool: ${property.pool}`;
  const isCritical = property.notifications?.includes("critical");
  const isReminder = property.notifications?.includes("reminder");

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-white">
          {/* HEADER — address + flavor + status, then pain/todo/action */}
          <div className="px-6 pt-5 pb-3">
            {/* ROW 1 — Action row mirroring DealCard exactly:
                ☐ checkbox · pulsing action circle · HIGH (colored text, no
                pill) · action text (orange bold) · 3 channel shortcuts ·
                Critical · Reminder ........ status pill · ⋮ */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <ActionCircle channel={rec} />
              {detail.pain !== "none" && (
                <span
                  className={`text-[12px] font-semibold uppercase tracking-wide cursor-help ${PAIN_TEXT[detail.pain]}`}
                  title={detail.painSig.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                >
                  {detail.painLabel}
                </span>
              )}
              <span
                className="text-[15px] font-semibold leading-snug text-orange-600 hover:text-orange-700 cursor-help"
                title={`${REC_COPY[rec].label} — ${REC_COPY[rec].how}`}
              >
                {property.nextSteps}
              </span>
              {isCritical && (
                <span className="text-[12px] font-semibold text-[#E24B4A] cursor-help" title="Critical flag">
                  Critical
                </span>
              )}
              {isReminder && (
                <span className="text-[12px] font-semibold text-[#2F86D6] cursor-help" title="Reminder set">
                  Reminder
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer hover:text-gray-900 shrink-0">
                <span className="font-semibold">{property.offerPct}%</span>
                <span>{property.offerLabel}</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-gray-400">
                  <polyline points="4,6 8,10 12,6" />
                </svg>
              </span>
            </div>

            {/* ROW 2 — Address + globe · source — status · sales-type ·
                keywords ........ Opened/Called dates */}
            <div className="flex items-center flex-wrap gap-x-2 mt-2.5 text-[13px] text-gray-700 leading-6">
              <button
                type="button"
                title="More actions"
                className="shrink-0 inline-flex items-center justify-center w-4 text-gray-400 hover:text-gray-700 cursor-pointer -ml-0.5"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <circle cx="8" cy="3" r="1.4" />
                  <circle cx="8" cy="8" r="1.4" />
                  <circle cx="8" cy="13" r="1.4" />
                </svg>
              </button>
              <span className="font-semibold text-gray-900 truncate max-w-full" title={property.address}>
                {property.address}
              </span>
              <button className="shrink-0 text-gray-400 hover:text-orange-500 cursor-pointer" title="Open map">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5">
                  <circle cx="6" cy="6" r="5" />
                  <line x1="1" y1="6" x2="11" y2="6" />
                  <path d="M6 1c1.5 1.5 1.5 8.5 0 10M6 1c-1.5 1.5-1.5 8.5 0 10" />
                </svg>
              </button>
              <span className="shrink-0 text-gray-300">·</span>
              <span className="shrink-0 cursor-help text-gray-700" title={`${property.source} · ${SALES_TYPE_LABELS[property.type.toUpperCase()] ?? property.type}`}>
                <span className="font-medium">{property.source.replace(/\s*—\s*.*$/, "")}</span>
                {" — "}
                <span className="font-medium" style={{ color: sourceTextColor(property.source, property.sourceStatus) }}>
                  {property.sourceStatus || (property.source.match(/\s*—\s*(.*)$/)?.[1] ?? "")}
                </span>
                <span> - {SALES_TYPE_LABELS[property.type.toUpperCase()] ?? property.type}</span>
              </span>
              <span className="shrink-0 text-gray-300">·</span>
              <span className="shrink-0 text-[12px] text-gray-500 cursor-help" title="Keywords pulled from listing remarks">
                Keywords: <span className={KW_TEXT[detail.kw]}>{detail.kwLabel}</span>
              </span>
              <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 text-[11.5px] text-gray-500">
                <span
                  className={`font-medium cursor-help ${FRESHNESS[gradeFreshness(property.lastOpenDate)]}`}
                  title={`Last opened: ${property.lastOpenDate}`}
                >
                  Opened {property.lastOpenDate}
                </span>
                <span className="text-gray-300">·</span>
                <span
                  className={`font-medium cursor-help ${FRESHNESS[gradeFreshness(property.lastCalledDate)]}`}
                  title={`Last called: ${property.lastCalledDate}`}
                >
                  Called {property.lastCalledDate}
                </span>
              </span>
            </div>

            {/* ROW 3 — Data row. Same fields as DealCard's bottom row, with
                hover-only details via the title attribute. */}
            <div className="flex items-center gap-x-2 flex-wrap mt-2.5 text-[13px] text-gray-700 leading-6">
              <button
                type="button"
                title="Comments"
                className="shrink-0 inline-flex items-center justify-center text-gray-400 hover:text-orange-500 cursor-pointer -ml-0.5"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
                  <path d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" />
                </svg>
              </button>
              <span
                className="font-semibold text-gray-900 cursor-help"
                title={`Asking ${property.price} · ARV ${detail.arv}`}
              >
                {compactPrice(property.price)}
              </span>
              <span className="text-gray-300">·</span>
              <span className="font-medium text-gray-700 cursor-help" title={`Asking vs ARV: ${detail.arvPct}`}>
                {detail.arvPct}
              </span>
              <span className="text-gray-300">·</span>
              <span
                className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 cursor-help"
                title={detail.painSig.map(([k, v]) => `${k}: ${v}`).join(" · ")}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${PAIN_DOT[detail.pain]}`} />
                Pain: <span className="text-gray-800 font-medium">{detail.painLabel}</span>
              </span>
              <span className="text-gray-300">·</span>
              <span
                className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 cursor-help"
                title={`Response rate: ${detail.agentRate ?? "—"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${AGENT_DOT[detail.agent]}`} />
                Agent: <span className="text-gray-800 font-medium">{detail.agentLabel}</span>
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-[12px] text-gray-500 cursor-help" title="Investor Sourced Count">
                ISC:{" "}
                <span className={(detail.isc ?? 0) > 0 ? "font-medium text-[#2F86D6]" : "font-medium text-gray-400"}>
                  {detail.isc ?? 0}
                </span>
              </span>
              <span className="text-gray-300">·</span>
              <span
                className="font-medium text-gray-700 tabular-nums cursor-help"
                title={`Sold ${detail.trackSold ?? 0} · Pending ${detail.trackPending ?? 0} · Backup ${detail.trackBackup ?? 0} · Active ${detail.trackActive ?? 0}`}
              >
                {detail.trackSold ?? 0}S / {detail.trackPending ?? 0}P / {detail.trackBackup ?? 0}B /{" "}
                <span className={(detail.trackActive ?? 0) > 0 ? "text-[#D67432] font-semibold" : ""}>
                  {detail.trackActive ?? 0}A
                </span>
              </span>
            </div>
          </div>

          {/* PROPERTY BASICS — blends with the header above (no divider on
              top); a soft line below separates it from the workflow row. */}
          <div className="px-6 pt-1 pb-4 border-b border-gray-100">
            <div className="text-[13px] text-gray-800 leading-6 min-w-0" title={propertyBasics}>
              {propertyBasics}
            </div>
          </div>

          {/* WORKFLOW STEPPER — thin inline progress. Contact icons (with an
              orange "action needed" dot) only appear at the final step
              (Offer Terms), pinned all the way to the right. */}
          <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-4">
            <WorkflowTabs active={activeStep} onChange={setActiveStep} />
            {activeStep === WORKFLOW_STEPS.length - 1 && (
              <div className="ml-auto flex items-center gap-1 shrink-0">
                <NavActionIcon kind="call" needsAction />
                <NavActionIcon kind="text" />
                <NavActionIcon kind="email" />
                <span className="mx-1 h-5 w-px bg-gray-200" />
                <SecondaryIconStrip detail={detail} />
              </div>
            )}
          </div>

          {/* Body intentionally empty — prototyping. */}
        </div>
        <IqAskBar />
      </div>
    </div>
  );
}

/* ───────────── presentational helpers ───────────── */

/**
 * Minimalist workflow stepper. Five pills, click to switch. The active step
 * is filled orange; completed steps (index < active) show a check before the
 * label; idle steps are gray.
 */
const WORKFLOW_STEPS = ["PIQ", "Comps", "Investment Analysis", "Agent", "Offer Terms"] as const;

function WorkflowTabs({
  active,
  onChange,
}: {
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-[12px] flex-wrap">
      {WORKFLOW_STEPS.map((label, i) => {
        const isActive = i === active;
        const isDone = i < active;
        return (
          <span key={label} className="inline-flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">›</span>}
            <button
              type="button"
              onClick={() => onChange(i)}
              className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
                isActive
                  ? "text-orange-600 font-semibold"
                  : isDone
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title={isDone ? `${label} — completed` : isActive ? `${label} — current` : label}
            >
              {isDone ? (
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-emerald-600">
                  <polyline points="3,8 7,12 13,4" />
                </svg>
              ) : isActive ? (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full border border-gray-300" />
              )}
              <span>{label}</span>
            </button>
          </span>
        );
      })}
    </div>
  );
}


/**
 * Five small icons for the secondary nav (Notes / Comms / Reminders /
 * Activity / Tax Data). Hover reveals a label tooltip — keeps the header
 * dense without sacrificing access.
 */
function SecondaryIconStrip({ detail }: { detail: DealDetail }) {
  const commCount = detail.commLog
    ? (["call", "text", "email"] as const).reduce((n, k) => {
        const c = detail.commLog?.[k];
        return n + (c?.lastSent ? 1 : 0) + (c?.lastReply ? 1 : 0);
      }, 0)
    : 0;
  const items: { key: string; title: string; badge?: number; icon: ReactNode }[] = [
    {
      key: "notes",
      title: "Property Notes",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
          <path d="M3 2h7l3 3v9H3V2z" />
          <polyline points="10,2 10,5 13,5" />
          <line x1="5" y1="8" x2="11" y2="8" />
          <line x1="5" y1="11" x2="11" y2="11" />
        </svg>
      ),
    },
    {
      key: "comms",
      title: "Communications",
      badge: commCount,
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
          <path d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" />
        </svg>
      ),
    },
    {
      key: "reminders",
      title: "Reminders",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
          <circle cx="8" cy="9" r="5.5" />
          <polyline points="8,6 8,9 10,10.5" />
          <line x1="6" y1="2" x2="3.5" y2="4" />
          <line x1="10" y1="2" x2="12.5" y2="4" />
        </svg>
      ),
    },
    {
      key: "activity",
      title: "Activity",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
          <polyline points="2,9 5,9 7,4 9,12 11,7 14,7" />
        </svg>
      ),
    },
    {
      key: "tax",
      title: "Tax Data",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
          <rect x="2.5" y="2.5" width="11" height="11" rx="1" />
          <line x1="2.5" y1="6" x2="13.5" y2="6" />
          <line x1="6" y1="6" x2="6" y2="13.5" />
        </svg>
      ),
    },
  ];
  return (
    <div className="flex items-center gap-2">
      {items.map((it) => (
        <button
          key={it.key}
          title={it.badge ? `${it.title} (${it.badge})` : it.title}
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
        >
          {it.icon}
          {it.badge ? (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold leading-none">
              {it.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * Call / Text / Email icon button shown on the workflow nav row's right side.
 * Matches the visual treatment of the SecondaryIconStrip buttons so the two
 * groups read as one cohesive cluster.
 */
function NavActionIcon({ kind, needsAction }: { kind: "call" | "text" | "email"; needsAction?: boolean }) {
  const label = kind === "call" ? "Call" : kind === "text" ? "Text" : "Email";
  const icon =
    kind === "call" ? (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
        <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" />
      </svg>
    ) : kind === "text" ? (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
        <path d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" />
      </svg>
    ) : (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
        <rect x="2" y="3.5" width="12" height="9" rx="1" />
        <polyline points="2.5,4.5 8,9 13.5,4.5" />
      </svg>
    );
  return (
    <button
      type="button"
      title={needsAction ? `${label} — action needed` : label}
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
    >
      {icon}
      {needsAction && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
      )}
    </button>
  );
}

/**
 * Channel-aware action circle — same logic & colors as the orange action
 * circle on Row 1 of DealCard.
 */
function ActionCircle({ channel }: { channel: RecChannel }) {
  const copy = REC_COPY[channel];
  const icon =
    channel === "call" ? (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" /></svg>
    ) : channel === "text" ? (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" /></svg>
    ) : (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><rect x="2" y="3.5" width="12" height="9" rx="1" /><polyline points="2.5,4.5 8,9 13.5,4.5" /></svg>
    );
  return (
    <button
      type="button"
      title={copy.label}
      className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer bg-orange-50 border border-orange-300 text-orange-600 hover:bg-orange-500 hover:text-white ring-2 ring-orange-300 shadow-[0_0_0_3px_rgba(251,146,60,0.35)] animate-pulse"
    >
      {icon}
    </button>
  );
}

