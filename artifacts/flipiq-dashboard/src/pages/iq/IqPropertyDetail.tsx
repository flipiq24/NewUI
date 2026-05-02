import { useMemo, type ReactNode } from "react";
import { useParams, useLocation } from "wouter";
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

  const propertyBasics = `${property.propertyType} / ${property.beds} Br / ${property.baths} Ba / ${property.garage} Gar / ${property.year} / ${property.sqft} / ${property.lotSqft} / Pool: ${property.pool}`;
  const isCritical = property.notifications?.includes("critical");
  const isReminder = property.notifications?.includes("reminder");

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb — secondary-tab icons on the LEFT, then breadcrumb,
            then Back on the right. */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => navigate("/iq/deal-review")}
              className="shrink-0 text-gray-500 hover:text-orange-500 cursor-pointer p-1 -ml-1"
              title="Back to Deal Review"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="10,3 5,8 10,13" />
              </svg>
            </button>
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

        {/* Body intentionally empty — prototyping. */}
        <div className="flex-1 overflow-y-auto bg-white" />
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

