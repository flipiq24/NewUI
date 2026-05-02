import { useMemo, useState, type ReactNode } from "react";
import { useParams, useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import { DEAL_REVIEW_PROPERTIES, type DealProperty } from "@/lib/iq/mockData";
import { DEAL_DETAILS, type DealDetail } from "@/lib/iq/dealDetails";
import {
  AGENT_DOT,
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
  const [, navigate] = useLocation();
  const decoded = decodeURIComponent(params.address ?? "");

  // Look up by exact address; fall back to the first deal so the page is
  // always navigable as a demo entry point (e.g. when visiting the literal
  // `:address` placeholder URL).
  const property = useMemo<DealProperty>(() => {
    const match = DEAL_REVIEW_PROPERTIES.find((p) => p.address === decoded);
    return match ?? DEAL_REVIEW_PROPERTIES[0];
  }, [decoded]);
  const detail: DealDetail = DEAL_DETAILS[property.id];

  const rec = recommendedChannel(detail);
  const [detailed, setDetailed] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);

  const propertyBasics = `${property.propertyType} / ${property.beds} Br / ${property.baths} Ba / ${property.garage} Gar / ${property.year} / ${property.sqft} / ${property.lotSqft} / Pool: ${property.pool}`;
  const isCritical = property.notifications?.includes("critical");
  const isReminder = property.notifications?.includes("reminder");

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar />

        {/* Breadcrumb — secondary-tab icons on the LEFT, then breadcrumb,
            then Back on the right. */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <SecondaryIconStrip detail={detail} />
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <span className="text-sm text-gray-500 truncate">
              <button
                onClick={() => navigate("/iq/deal-review")}
                className="hover:text-orange-500 cursor-pointer"
              >
                Deal Review
              </button>
              {" › "}
              <span className="font-semibold text-gray-800 underline decoration-orange-500 decoration-2 underline-offset-2">
                {property.address.split(",")[0]}
              </span>
            </span>
          </div>
          <button
            onClick={() => navigate("/iq/deal-review")}
            className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-orange-500 transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="10,3 5,8 10,13" />
            </svg>
            Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {/* HEADER — address + flavor + status, then pain/todo/action */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            {/* ROW 1 — Action row mirroring DealCard exactly:
                ☐ checkbox · pulsing action circle · HIGH (colored text, no
                pill) · action text (orange bold) · 3 channel shortcuts ·
                Critical · Reminder ........ status pill · ⋮ */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer shrink-0"
                title="Mark as done"
              />
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
              <ChannelShortcut kind="call" />
              <ChannelShortcut kind="text" />
              <ChannelShortcut kind="email" />
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
              <div className="ml-auto shrink-0 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-700 cursor-pointer hover:text-gray-900">
                  <span className="font-semibold">{property.offerPct}%</span>
                  <span>{property.offerLabel}</span>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-gray-400">
                    <polyline points="4,6 8,10 12,6" />
                  </svg>
                </span>
                <button className="text-gray-400 hover:text-gray-700 cursor-pointer p-1" title="More">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <circle cx="8" cy="3" r="1.4" />
                    <circle cx="8" cy="8" r="1.4" />
                    <circle cx="8" cy="13" r="1.4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ROW 2 — Address + globe · source — status · sales-type ·
                keywords ........ Opened/Called dates */}
            <div className="flex items-center flex-wrap gap-x-2 mt-2 text-[13px] text-gray-700 leading-6">
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
              <span className="ml-auto shrink-0 text-[12px] text-gray-500" title="Last opened / Last called">
                Opened <span className="text-emerald-600 font-medium">{property.lastOpenDate}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                Called <span className="text-gray-700 font-medium">{property.lastCalledDate}</span>
              </span>
            </div>

            {/* ROW 3 — Data row. Same fields as DealCard's bottom row, with
                hover-only details via the title attribute. */}
            <div className="flex items-center gap-x-2 flex-wrap mt-2 text-[13px] text-gray-700 leading-6">
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
                title={`Active ${detail.trackActive ?? 0} · Pending ${detail.trackPending ?? 0} · Backup ${detail.trackBackup ?? 0} · Sold ${detail.trackSold ?? 0}`}
              >
                <span className={(detail.trackActive ?? 0) > 0 ? "text-[#D67432] font-semibold" : ""}>
                  {detail.trackActive ?? 0}A
                </span>
                {" / "}{detail.trackBackup ?? 0}B / {detail.trackPending ?? 0}P / {detail.trackSold ?? 0}S
              </span>
            </div>
          </div>

          {/* PROPERTY BASICS — always visible one-liner. The Details
              section below is hidden by default; click the toggle to reveal
              the 5 metric cards. */}
          <div className="px-6 pt-4 pb-3 flex items-start justify-between gap-4 border-b border-gray-100">
            <div className="text-[13px] text-gray-800 leading-6 min-w-0" title={propertyBasics}>
              {propertyBasics}
            </div>
            <button
              type="button"
              onClick={() => setSnapshotOpen((v) => !v)}
              className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
              title={snapshotOpen ? "Hide details" : "Show details"}
            >
              <span>{snapshotOpen ? "Hide" : "Show"} details</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-3 h-3 transition-transform ${snapshotOpen ? "rotate-180" : ""}`}
              >
                <polyline points="4,6 8,10 12,6" />
              </svg>
            </button>
          </div>

          {/* DETAILS — collapsed by default */}
          {snapshotOpen && (
          <>
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
              Details
            </div>
            <SimpleDetailedToggle value={detailed} onChange={setDetailed} />
          </div>
          <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <MetricCard
              label="Property Details"
              headline={propertyBasics}
              detailed={detailed}
            >
              <div className="text-[13px] text-gray-800 leading-6">
                {propertyBasics}
              </div>
            </MetricCard>

            <MetricCard
              label="List Price"
              headline={compactPrice(property.price)}
              detailed={detailed}
            >
              <div className="text-[18px] font-bold text-gray-900 mb-1">{compactPrice(property.price)}</div>
              <div className="text-[12px] text-gray-600 mb-1.5">
                Propensity: <span className="font-semibold text-orange-500">{property.propensityScore ?? "—"}</span>
                <span className="mx-1.5 text-gray-300">|</span>
                <span className={PAIN_TEXT[detail.pain]}>{detail.painLabel}</span>
              </div>
              {property.tags.length > 0 && (
                <div className="text-[11.5px] text-emerald-700 leading-snug">
                  {property.tags.slice(0, 3).join(" · ")}
                  {property.tags.length > 3 && (
                    <span className="text-gray-400"> · +{property.tags.length - 3} more</span>
                  )}
                </div>
              )}
            </MetricCard>

            <MetricCard
              label="Market Info"
              headline={`${property.days} Days · ${property.sourceStatus || "—"}`}
              detailed={detailed}
            >
              <div className="text-[13px] text-gray-900 font-semibold">
                {property.days} Days{" "}
                <span
                  className="font-medium"
                  style={{ color: sourceTextColor(property.source, property.sourceStatus) }}
                >
                  / {property.sourceStatus || "—"}
                </span>
              </div>
              <div className="text-[12px] text-gray-600 mt-1">
                DOM: {property.dom} · CDOM: {property.cdom}
              </div>
              <div className="text-[12px] text-gray-700 font-semibold mt-1.5">
                {property.type.toUpperCase()}
              </div>
            </MetricCard>

            <MetricCard
              label="Evaluation Metrics"
              headline={`${detail.arvPct} ARV`}
              detailed={detailed}
            >
              <div className="text-[13px] text-gray-900">
                Asking VS ARV: <span className="font-bold">{detail.arvPct}</span>
              </div>
              <div className="text-[12px] text-gray-600 mt-1">ARV: {detail.arv}</div>
              <div className="text-[12px] text-gray-600 mt-1.5">
                Comp Data:{" "}
                <span className="font-medium">
                  A{detail.trackActive ?? 0}, P{detail.trackPending ?? 0}, B{detail.trackBackup ?? 0}, C{detail.trackSold ?? 0}
                </span>
              </div>
            </MetricCard>

            <MetricCard
              label="Last Open / Last Comm"
              headline={`LOD ${property.lastOpenDate}`}
              detailed={detailed}
            >
              <div className="text-[13px] text-gray-900">LOD: {property.lastOpenDate}</div>
              <div className="text-[12px] text-emerald-600 mt-0.5">{property.lastOpenNote}</div>
              <div className="text-[12px] text-gray-700 mt-1.5">LCD: {property.lastCalledDate}</div>
            </MetricCard>
          </div>
          </>
          )}

          {/* Body intentionally empty — prototyping. */}
        </div>
        <IqAskBar />
      </div>
    </div>
  );
}

/* ───────────── presentational helpers ───────────── */

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
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
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
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
          <path d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" />
        </svg>
      ),
    },
    {
      key: "reminders",
      title: "Reminders",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
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
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
          <polyline points="2,9 5,9 7,4 9,12 11,7 14,7" />
        </svg>
      ),
    },
    {
      key: "tax",
      title: "Tax Data",
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5">
          <rect x="2.5" y="2.5" width="11" height="11" rx="1" />
          <line x1="2.5" y1="6" x2="13.5" y2="6" />
          <line x1="6" y1="6" x2="6" y2="13.5" />
        </svg>
      ),
    },
  ];
  return (
    <div className="flex items-center gap-0.5">
      {items.map((it) => (
        <button
          key={it.key}
          title={it.badge ? `${it.title} (${it.badge})` : it.title}
          className="relative inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
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

/** Two-state pill toggle for Simple vs Detailed metric-card view. */
function SimpleDetailedToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex bg-gray-100 rounded-full p-0.5 text-[11px] font-semibold">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
          !value ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Simple
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
          value ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Detailed
      </button>
    </div>
  );
}

/**
 * Collapsible metric card. Simple mode = headline only; Detailed = full
 * children. Each card is also independently togglable via the chevron.
 */
function MetricCard({
  label,
  headline,
  detailed,
  children,
}: {
  label: string;
  headline: string;
  detailed: boolean;
  children: ReactNode;
}) {
  const [override, setOverride] = useState<boolean | null>(null);
  const expanded = override ?? detailed;
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <button
        type="button"
        onClick={() => setOverride(!expanded)}
        className="w-full flex items-center justify-between mb-2 cursor-pointer group"
      >
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
          {label}
        </span>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <polyline points="4,6 8,10 12,6" />
        </svg>
      </button>
      {expanded ? (
        children
      ) : (
        <div className="text-[14px] font-semibold text-gray-900 leading-tight">
          {headline}
        </div>
      )}
    </div>
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
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" /></svg>
    ) : channel === "text" ? (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" /></svg>
    ) : (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="2" y="3.5" width="12" height="9" rx="1" /><polyline points="2.5,4.5 8,9 13.5,4.5" /></svg>
    );
  return (
    <button
      type="button"
      title={copy.label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer transition-colors"
    >
      {icon}
    </button>
  );
}

/** Inline channel quick-shortcut — call/text/email — shown as the small
 *  outlined icons after the recommended ActionCircle. Mirrors the chips on
 *  DealCard. Click is a no-op for now; tooltip identifies the channel. */
function ChannelShortcut({ kind }: { kind: "call" | "text" | "email" }) {
  const label = kind === "call" ? "Quick call" : kind === "text" ? "Quick text" : "Quick email";
  const icon =
    kind === "call" ? (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" /></svg>
    ) : kind === "text" ? (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5"><path d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" /></svg>
    ) : (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-3.5 h-3.5"><rect x="2" y="3.5" width="12" height="9" rx="1" /><polyline points="2.5,4.5 8,9 13.5,4.5" /></svg>
    );
  return (
    <button
      type="button"
      title={label}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 cursor-pointer transition-colors"
    >
      {icon}
    </button>
  );
}

