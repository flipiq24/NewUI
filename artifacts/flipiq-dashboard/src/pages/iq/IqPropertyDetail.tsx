import { Fragment, useMemo, useState, type ReactNode } from "react";
import { useParams, useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import { DEAL_REVIEW_PROPERTIES, type DealProperty } from "@/lib/iq/mockData";
import { DEAL_DETAILS, type DealDetail } from "@/lib/iq/dealDetails";
import {
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
  const [activeStep, setActiveStep] = useState("PIQ");

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar />

        {/* Breadcrumb + secondary-tab icon strip + Back */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-gray-500">
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
          <div className="flex items-center gap-1">
            <SecondaryIconStrip detail={detail} />
            <span className="w-px h-5 bg-gray-200 mx-2" />
            <button
              onClick={() => navigate("/iq/deal-review")}
              className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-orange-500 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="10,3 5,8 10,13" />
              </svg>
              Back
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {/* HEADER — address + flavor + status, then pain/todo/action */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                <h1 className="text-[20px] font-bold text-gray-900 truncate">
                  {property.address}
                </h1>
                <button className="shrink-0 text-gray-400 hover:text-orange-500 cursor-pointer" title="Open map">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3.5 h-3.5">
                    <circle cx="6" cy="6" r="5" />
                    <line x1="1" y1="6" x2="11" y2="6" />
                    <path d="M6 1c1.5 1.5 1.5 8.5 0 10M6 1c-1.5 1.5-1.5 8.5 0 10" />
                  </svg>
                </button>
                <button className="shrink-0 text-gray-400 hover:text-orange-500 cursor-pointer" title="Edit">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                    <path d="M3 13l2-.5 7-7-1.5-1.5-7 7L3 13z" />
                  </svg>
                </button>
                <span className="text-[12.5px] text-orange-600 font-medium ml-1">
                  Agent has 3 other listings
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-700 border border-gray-300 rounded-full px-3 py-1">
                  <span className="font-semibold">{property.offerPct}%</span>
                  <span>{property.offerLabel}</span>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-gray-400 ml-0.5">
                    <polyline points="4,6 8,10 12,6" />
                  </svg>
                </span>
                <button className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 border border-gray-200 rounded-full" title="More">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <circle cx="8" cy="3" r="1.4" />
                    <circle cx="8" cy="8" r="1.4" />
                    <circle cx="8" cy="13" r="1.4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Pain + To do + action — single tight row, no extra source line */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase tracking-wide bg-gray-50 border border-gray-200 ${PAIN_TEXT[detail.pain]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PAIN_DOT[detail.pain]}`} />
                {detail.painLabel}
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer text-[13px] text-gray-700">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer" />
                <span>To do: <span className="font-medium text-gray-900">{property.nextSteps}</span></span>
              </label>
              <span className="text-gray-300">·</span>
              <ActionCircle channel={rec} />
              <span className="text-gray-300">·</span>
              <span className="text-[12px] text-gray-500">
                {property.source.replace(/\s*—\s*.*$/, "")}{" — "}
                <span style={{ color: sourceTextColor(property.source, property.sourceStatus) }}>
                  {property.sourceStatus || (property.source.match(/\s*—\s*(.*)$/)?.[1] ?? "")}
                </span>
                {" · "}
                {SALES_TYPE_LABELS[property.type.toUpperCase()] ?? property.type}
                {" · "}
                Keywrds: <span className={KW_TEXT[detail.kw]}>{detail.kwLabel}</span>
              </span>
            </div>
          </div>

          {/* METRIC CARDS with Simple / Detailed toggle */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400">
              Snapshot
            </div>
            <SimpleDetailedToggle value={detailed} onChange={setDetailed} />
          </div>
          <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <MetricCard
              label="Property Details"
              headline={`${property.propertyType} · ${property.beds} Br`}
              detailed={detailed}
            >
              <div className="text-[13px] text-gray-800 leading-6">
                {property.propertyType} / {property.beds} Br / {property.baths} Ba / {property.garage} Gar /{" "}
                {property.year} / {property.sqft} / {property.lotSqft} / Pool: {property.pool}
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

          {/* WORKFLOW STEPPER — PIQ → Offer Terms */}
          <WorkflowStepper active={activeStep} onChange={setActiveStep} />

          {/* PIQ TAB BODY */}
          {activeStep === "PIQ" && (
            <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <RecommendedActionPanel detail={detail} channel={rec} />
              <CommunicationsPanel detail={detail} />
              <PriceHistoryPanel detail={detail} />
              <ListingRemarksPanel detail={detail} />
              <PainSignalsPanel detail={detail} />
              <AssignmentsPanel detail={detail} />
            </div>
          )}
          {activeStep !== "PIQ" && (
            <div className="px-6 py-16 text-center text-gray-400 text-sm">
              <span className="font-medium text-gray-500">{activeStep}</span> step is
              not yet wired up — keep going through the workflow above.
            </div>
          )}
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

/**
 * Workflow stepper — PIQ → Comps → Investment Analysis → Agent → Offer
 * Terms. Steps before active are "complete" (green check), active is
 * orange, future is muted gray. Click to jump.
 */
function WorkflowStepper({
  active,
  onChange,
}: {
  active: string;
  onChange: (s: string) => void;
}) {
  const steps = ["PIQ", "Comps", "Investment Analysis", "Agent", "Offer Terms"];
  const activeIdx = steps.indexOf(active);
  return (
    <div className="px-6 py-4 border-y border-gray-100 bg-gray-50/40">
      <div className="flex items-center justify-between gap-1 max-w-3xl mx-auto">
        {steps.map((step, i) => {
          const isActive = i === activeIdx;
          const isComplete = i < activeIdx;
          return (
            <Fragment key={step}>
              <button
                type="button"
                onClick={() => onChange(step)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group min-w-0"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    isActive
                      ? "bg-orange-500 text-white ring-4 ring-orange-100"
                      : isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                  }`}
                >
                  {isComplete ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                      <polyline points="3,8 7,12 13,4" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-[11px] font-medium whitespace-nowrap ${
                    isActive
                      ? "text-orange-600"
                      : isComplete
                      ? "text-emerald-700"
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                >
                  {step}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1 mb-5 transition-colors ${
                    i < activeIdx ? "bg-emerald-300" : "bg-gray-200"
                  }`}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function PanelCard({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 bg-white ${className}`}>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-orange-600 mb-2.5">
        {title}
      </div>
      {children}
    </div>
  );
}

function RecommendedActionPanel({ detail, channel }: { detail: DealDetail; channel: RecChannel }) {
  const copy = REC_COPY[channel];
  return (
    <PanelCard title="Recommended Action" className="lg:col-span-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-[11px] font-bold uppercase">
          {channel[0]}
        </span>
        <span className="text-[14px] font-semibold text-gray-900">{copy.label}</span>
      </div>
      <p className="text-[12.5px] text-gray-700 leading-relaxed mb-3">{copy.tip}</p>
      <div className="border-t border-gray-100 pt-3 space-y-1.5 text-[12.5px]">
        {detail.taskWho && <Row label="Who" value={detail.taskWho} />}
        {detail.taskWhat && <Row label="What" value={detail.taskWhat} />}
        <Row label="How" value={copy.how} />
      </div>
    </PanelCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-12 shrink-0 text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-0.5">{label}</span>
      <span className="text-gray-800 leading-snug">{value}</span>
    </div>
  );
}

function CommunicationsPanel({ detail }: { detail: DealDetail }) {
  const log = detail.commLog;
  if (!log) {
    return (
      <PanelCard title="Communications">
        <div className="text-[12.5px] text-gray-500 italic">No messages on file yet.</div>
      </PanelCard>
    );
  }
  const channels: { key: "call" | "text" | "email"; label: string }[] = [
    { key: "call", label: "Call" },
    { key: "text", label: "Text" },
    { key: "email", label: "Email" },
  ];
  return (
    <PanelCard title="Communications">
      <div className="space-y-3">
        {channels.map(({ key, label }) => {
          const c = log[key];
          if (!c?.lastSent && !c?.lastReply) return null;
          return (
            <div key={key}>
              <div className="text-[10.5px] uppercase tracking-wider text-gray-400 font-semibold mb-1">{label}</div>
              {c.lastSent && (
                <div className="text-[12px] text-gray-700 mb-0.5">
                  <span className="text-gray-400">Sent {c.lastSent.ts}:</span> {c.lastSent.body}
                </div>
              )}
              {c.lastReply && (
                <div className="text-[12px] text-emerald-700">
                  <span className="text-gray-400">Reply {c.lastReply.ts}:</span> {c.lastReply.body}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}

function PriceHistoryPanel({ detail }: { detail: DealDetail }) {
  return (
    <PanelCard title="Price History">
      <div className="space-y-1 text-[12.5px]">
        <div className="flex justify-between gap-3 text-gray-500">
          <span>DOM / CDOM</span>
          <span className="text-gray-800 font-medium">
            {detail.prop.find(([k]) => k === "DOM / CDOM")?.[1] ?? "—"}
          </span>
        </div>
        {detail.priceHist.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="text-gray-500">{k}</span>
            <span className="text-gray-900 font-medium">{v}</span>
          </div>
        ))}
        {detail.priceTotal && detail.priceTotal !== "—" && (
          <div className="flex justify-between gap-3 pt-1.5 border-t border-gray-100 mt-1.5">
            <span className="text-gray-500">Total reduction</span>
            <span className="text-gray-900 font-semibold">{detail.priceTotal}</span>
          </div>
        )}
      </div>
    </PanelCard>
  );
}

function ListingRemarksPanel({ detail }: { detail: DealDetail }) {
  return (
    <PanelCard title="Listing Remarks">
      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Public</div>
      <KwHtml html={detail.pubCmt} />
      <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-3 mb-1">Agent</div>
      <KwHtml html={detail.agtCmt} />
    </PanelCard>
  );
}

function PainSignalsPanel({ detail }: { detail: DealDetail }) {
  if (!detail.painSig.length) return null;
  return (
    <PanelCard title="Pain Signals">
      <div className="space-y-1 text-[12.5px]">
        {detail.painSig.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="text-gray-500">{k}</span>
            <span className="text-gray-900 font-medium text-right">{v}</span>
          </div>
        ))}
      </div>
    </PanelCard>
  );
}

function AssignmentsPanel({ detail }: { detail: DealDetail }) {
  return (
    <PanelCard title="Assignments">
      <div className="space-y-1 text-[12.5px]">
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Source</span>
          <span className="text-gray-900 font-medium">{detail.source}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Negotiator</span>
          <span className="text-gray-900 font-medium">{detail.negotiator}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Property assigned to</span>
          <span className="text-gray-900 font-medium">{detail.assigned}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">Status</span>
          <span className="text-gray-900 font-medium">{detail.pct} · {detail.status}</span>
        </div>
      </div>
    </PanelCard>
  );
}

/** Same kw-pill renderer as DealCard. Inlined to keep this page standalone. */
function KwHtml({ html }: { html: string }) {
  const parts = html.split(/(<span class="kw">.*?<\/span>)/g);
  return (
    <p className="text-[12px] text-gray-900 leading-snug m-0">
      {parts.map((part, i) => {
        const m = part.match(/^<span class="kw">(.*?)<\/span>$/);
        if (m) {
          return (
            <span key={i} className="inline-block bg-red-500 text-white px-1.5 py-px rounded font-medium text-[10.5px] tracking-wide mx-0.5">
              {m[1]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
