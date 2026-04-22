import { useEffect, useState } from "react";
import type { DealProperty } from "@/lib/iq/mockData";

type Level = "high" | "mid" | "low" | "new";

const LEVEL_STYLES: Record<Level, { cls: string; label: string }> = {
  high: { cls: "bg-red-100 text-red-700 border border-red-200", label: "High" },
  mid: { cls: "bg-amber-100 text-amber-700 border border-amber-200", label: "Mid" },
  low: { cls: "bg-blue-100 text-blue-700 border border-blue-200", label: "Low" },
  new: { cls: "bg-gray-100 text-gray-600 border border-gray-200", label: "New" },
};

function LevelTag({ level, tip }: { level: Level; tip: string }) {
  const s = LEVEL_STYLES[level];
  return (
    <span
      title={tip}
      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded cursor-help ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function activityLevel(p: DealProperty): { level: Level; tip: string } {
  if (p.lastCalledDate === "N/A" && !p.lastOpenNote) {
    return { level: "new", tip: "Never opened or called" };
  }
  const note = p.lastOpenNote.toLowerCase();
  if (note.includes("today")) {
    return { level: "high", tip: "Reopened today — act fast" };
  }
  const m = note.match(/(\d+)\s*days?\s*ago/);
  if (m) {
    const days = parseInt(m[1], 10);
    if (days <= 14) return { level: "mid", tip: `Last activity ${days} days ago — still warm` };
    if (days <= 60) return { level: "low", tip: `Last activity ${days} days ago — cooling off` };
    return { level: "low", tip: `Last activity ${days} days ago — stale` };
  }
  return { level: "new", tip: "No recent activity recorded" };
}

function nextStepsLevel(p: DealProperty): { level: Level; tip: string } {
  if (!p.nextSteps || /not\s*set/i.test(p.nextSteps)) {
    return { level: "new", tip: "No next step defined yet" };
  }
  if (p.offerPct >= 50) return { level: "high", tip: "Offer in active negotiation — push it" };
  if (p.offerPct >= 20) return { level: "mid", tip: "Offer in progress — keep momentum" };
  if (p.offerPct > 0) return { level: "low", tip: "Initial contact made — follow up" };
  return { level: "new", tip: "No offer yet — open the conversation" };
}

function assignmentLevel(p: DealProperty): { level: Level; tip: string } {
  if (p.assignedUser === "Not Assigned") {
    return { level: "new", tip: "Nobody is assigned yet — claim it" };
  }
  if (p.negotiator === p.assignedUser) {
    return { level: "low", tip: "Owner and negotiator aligned" };
  }
  return { level: "mid", tip: "Negotiator differs from assigned user" };
}

/* ─────────── Daily checkoff hook ─────────── */

const ACTION_KEYS = ["call", "text", "email", "notes"] as const;
type ActionKey = (typeof ACTION_KEYS)[number];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function useDailyChecklist(propertyId: number) {
  const storageKey = `iqRowActions:${propertyId}:${todayStr()}`;
  const [done, setDone] = useState<Record<ActionKey, boolean>>(() => {
    if (typeof window === "undefined") {
      return { call: false, text: false, email: false, notes: false };
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return { call: false, text: false, email: false, notes: false };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(done));
  }, [storageKey, done]);

  function toggle(k: ActionKey) {
    setDone((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  const allDone = ACTION_KEYS.every((k) => done[k]);
  return { done, toggle, allDone };
}

/* ─────────── Action checklist ─────────── */

const ACTIONS: { key: ActionKey; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: "call", label: "Call", Icon: PhoneIcon },
  { key: "text", label: "Text", Icon: ChatIcon },
  { key: "email", label: "Email", Icon: EmailIcon },
  { key: "notes", label: "Update Notes", Icon: NotesIcon },
];

function ActionChecklist({
  done,
  toggle,
}: {
  done: Record<ActionKey, boolean>;
  toggle: (k: ActionKey) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-32 flex-shrink-0">
      {ACTIONS.map(({ key, label, Icon }) => {
        const isDone = done[key];
        return (
          <label
            key={key}
            className={`flex items-center gap-2 cursor-pointer select-none rounded px-1.5 py-1 transition-colors ${
              isDone ? "bg-green-50" : "hover:bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              checked={isDone}
              onChange={() => toggle(key)}
              className="w-4 h-4 accent-green-500 cursor-pointer flex-shrink-0"
            />
            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                isDone ? "text-green-600" : "text-gray-500"
              }`}
            />
            <span
              className={`text-[11px] font-medium transition-all ${
                isDone ? "text-gray-400 line-through" : "text-gray-700"
              }`}
            >
              {label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ─────────── Misc subcomponents ─────────── */

function OfferPill({ pct, label }: { pct: number; label: string }) {
  const color =
    pct >= 50
      ? "bg-orange-500 text-white"
      : pct > 0
      ? "bg-gray-100 text-gray-700 border border-gray-300"
      : "bg-white text-gray-500 border border-gray-300";
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
      {pct}% {label}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{children}</p>
  );
}

/* ─────────── Main row ─────────── */

export default function PropertyRow({ property, last }: { property: DealProperty; last?: boolean }) {
  const { done, toggle, allDone } = useDailyChecklist(property.id);
  const act = activityLevel(property);
  const ns = nextStepsLevel(property);
  const asg = assignmentLevel(property);

  const wrapperCls = [
    "px-5 py-4 transition-colors border-l-4",
    !last ? "border-b border-gray-100" : "",
    allDone
      ? "bg-green-50/60 border-l-green-400 hover:bg-green-50"
      : "bg-white border-l-transparent hover:bg-orange-50",
  ].join(" ");

  return (
    <div className={wrapperCls}>
      {/* Header: identity + status */}
      <div className="flex items-start gap-4">
        {/* Action checklist */}
        <ActionChecklist done={done} toggle={toggle} />

        {/* Identity column */}
        <div className="flex-1 min-w-0">
          {/* Top badges row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <span className="text-orange-500">▲</span>
              {property.priorityBadge}
            </span>
            <OfferPill pct={property.offerPct} label={property.offerLabel} />
            <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {property.type}
            </span>
            {allDone && (
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckIcon className="w-3 h-3" />
                Worked
              </span>
            )}
            <span className="text-[11px] text-gray-500 ml-auto">
              Source:{" "}
              <span
                className={
                  property.sourceStatus === "Active"
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 font-semibold"
                }
              >
                {property.source} · {property.sourceStatus}
              </span>
            </span>
          </div>

          {/* Address */}
          <p className="text-[14px] font-bold text-gray-900 mb-1 flex items-center gap-1.5 flex-wrap">
            <span>{property.address}</span>
            <GlobeIcon />
          </p>

          {/* Price line */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[20px] font-bold text-gray-900">{property.price}</span>
            {property.propensityScore !== null && (
              <span className="text-[11px] text-gray-500">
                Propensity:{" "}
                <span className="font-semibold text-gray-700">{property.propensityScore}</span>{" "}
                · {property.propensityLabel}
              </span>
            )}
            {property.tags.length > 0 && (
              <span className="text-[11px] text-gray-500 truncate">
                {property.tags.slice(0, 3).join(" · ")}
                {property.tags.length > 3 ? ` · +${property.tags.length - 3} more` : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-3 ml-36" />

      {/* Data grid — 3 sections, each topped with a level tag */}
      <div className="ml-36 grid grid-cols-3 gap-x-6 gap-y-3">
        {/* Activity */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <LevelTag level={act.level} tip={act.tip} />
            <FieldLabel>Activity</FieldLabel>
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Last Open</p>
              <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                {property.lastOpenDate}
              </p>
              {property.lastOpenNote && (
                <p className="text-[10px] text-orange-500 font-medium leading-tight">
                  {property.lastOpenNote}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Last Called</p>
              <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                {property.lastCalledDate}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <LevelTag level={ns.level} tip={ns.tip} />
            <FieldLabel>Next Steps</FieldLabel>
          </div>
          <span className="text-[11px] font-semibold bg-orange-500 text-white px-2.5 py-0.5 rounded-full inline-block">
            To do: {property.nextSteps}
          </span>
        </div>

        {/* Assignment */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <LevelTag level={asg.level} tip={asg.tip} />
            <FieldLabel>Assignment</FieldLabel>
          </div>
          <div className="space-y-1">
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Offer Negotiator</p>
              <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                {property.negotiator}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Assigned User</p>
              <p
                className={`text-[12px] font-semibold leading-tight ${
                  property.assignedUser === "Not Assigned" ? "text-gray-400" : "text-gray-800"
                }`}
              >
                {property.assignedUser}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Icons ─────────── */

function EmailIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <polyline points="2,5.5 10,12 18,5.5" strokeLinecap="round" />
    </svg>
  );
}
function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h4l2 5-2.5 1.5A11 11 0 0013.5 13.5L15 11l5 2v4a2 2 0 01-2 2C7 19 1 13 1 5a2 2 0 012-2z"
      />
    </svg>
  );
}
function ChatIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h14a1 1 0 011 1v9a1 1 0 01-1 1H8l-4 3v-3H3a1 1 0 01-1-1V5a1 1 0 011-1z"
      />
    </svg>
  );
}
function NotesIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 3h9l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <line x1="6" y1="9" x2="14" y2="9" strokeLinecap="round" />
      <line x1="6" y1="12" x2="14" y2="12" strokeLinecap="round" />
      <line x1="6" y1="15" x2="11" y2="15" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="3,8 7,12 13,4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <circle cx="8" cy="8" r="6" />
      <ellipse cx="8" cy="8" rx="2.5" ry="6" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}
