import type { DealProperty } from "@/lib/iq/mockData";
import { useDailyChecklist, setPropertyComplete, type ActionKey } from "@/lib/iq/dailyChecklist";

/* ─────────── Action checkbox column ─────────── */

const ACTIONS: { key: ActionKey; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: "email", label: "Email", Icon: EmailIcon },
  { key: "call", label: "Call", Icon: PhoneIcon },
  { key: "text", label: "Text", Icon: ChatIcon },
  { key: "notes", label: "Update Notes", Icon: NotesIcon },
];

function ActionIconColumn({
  done,
  toggle,
}: {
  done: Record<ActionKey, boolean>;
  toggle: (k: ActionKey) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1 w-7 flex-shrink-0 pt-0.5">
      {ACTIONS.map(({ key, label, Icon }) => {
        const isDone = done[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            title={`${isDone ? "Done" : "Mark done"}: ${label}`}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
              isDone
                ? "bg-green-100 text-green-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

/* ─────────── Pills ─────────── */

function OfferPill({ pct, label }: { pct: number; label: string }) {
  const color =
    pct >= 50
      ? "bg-orange-500 text-white border-orange-500"
      : pct > 0
      ? "bg-white text-gray-700 border-gray-300"
      : "bg-white text-gray-500 border-gray-300";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${color}`}>
      {pct}% {label}
      <CaretDown />
    </span>
  );
}

function HighPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
      <span className="text-orange-500">▲</span>
      {label}
      <CaretDown />
    </span>
  );
}

function ToDoPill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-500 text-white px-2.5 py-0.5 rounded-full max-w-[160px]">
      <span className="truncate">To do: {text}</span>
      <CaretDown />
    </span>
  );
}

/* ─────────── Tag chip ─────────── */

const TAG_CLASS: Record<string, string> = {
  green: "text-green-700",
  blue: "text-blue-700",
  amber: "text-amber-700",
  gray: "text-gray-600",
};

function tagColor(tag: string): keyof typeof TAG_CLASS {
  const t = tag.toLowerCase();
  if (t.includes("absentee") || t.includes("equity")) return "green";
  if (t.includes("corporate") || t.includes("trust")) return "blue";
  if (t.includes("delinq") || t.includes("default") || t.includes("affidavit")) return "amber";
  return "gray";
}

/* ─────────── Main row ─────────── */

export default function PropertyRow({ property, last }: { property: DealProperty; last?: boolean }) {
  const { done, toggle, allDone } = useDailyChecklist(property.id);

  const wrapperCls = [
    "px-3 py-3 transition-colors border-l-4 grid items-start gap-4",
    !last ? "border-b border-gray-100" : "",
    allDone
      ? "bg-green-50/60 border-l-green-400 hover:bg-green-50"
      : "bg-white border-l-transparent hover:bg-orange-50/50",
  ].join(" ");

  return (
    <div
      className={wrapperCls}
      style={{ gridTemplateColumns: "32px minmax(0,2.4fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)" }}
    >
      {/* 1. Actions column */}
      <ActionIconColumn done={done} toggle={toggle} />

      {/* 2. Property / Segments column */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <HighPill label={property.priorityBadge} />
          <input
            type="checkbox"
            checked={allDone}
            onChange={(e) => setPropertyComplete(property.id, e.target.checked)}
            title={allDone ? "Mark this property as not done" : "Mark this property done"}
            className="w-3.5 h-3.5 accent-green-500 cursor-pointer flex-shrink-0"
          />
          <ToDoPill text={property.nextSteps} />
          <OfferPill pct={property.offerPct} label={property.offerLabel} />
        </div>

        <p className="text-[13px] font-bold text-gray-900 leading-snug flex items-center gap-1 flex-wrap">
          <span className="truncate">{property.address}</span>
          <GlobeIcon />
          <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
            {property.type}
          </span>
        </p>

        <p className="text-[11px] text-gray-700 mt-1">
          <span className="font-semibold">Source: </span>
          <span className="font-bold text-gray-900">{property.source}</span>
          <span className="text-gray-400"> - </span>
          <span
            className={
              property.sourceStatus === "Active"
                ? "text-green-600 font-bold"
                : "text-gray-700 font-semibold"
            }
          >
            {property.sourceStatus}
          </span>
        </p>

        {allDone && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
            <CheckIcon className="w-3 h-3" /> Worked
          </span>
        )}
      </div>

      {/* 3. Price / Propensity column */}
      <div className="min-w-0">
        <p className="text-[16px] font-bold text-gray-900 leading-tight">{property.price}</p>
        {property.propensityScore !== null && (
          <p className="text-[11px] text-gray-600 mt-0.5">
            Propensity:{" "}
            <span className="font-bold text-orange-500">{property.propensityScore}</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="text-gray-500">{property.propensityLabel}</span>
          </p>
        )}
        {property.tags.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {property.tags.slice(0, 3).map((t, i) => (
              <p key={i} className={`text-[11px] font-medium leading-tight ${TAG_CLASS[tagColor(t)]}`}>
                {t}
              </p>
            ))}
            {property.tags.length > 3 && (
              <p className="text-[11px] text-gray-500 leading-tight">
                +{property.tags.length - 3} more
              </p>
            )}
          </div>
        )}
      </div>

      {/* 4. Last Open / Called column */}
      <div className="min-w-0 text-[11px] leading-snug">
        <p className="text-gray-500">Last Open Date:</p>
        <p className="font-semibold text-gray-900">{property.lastOpenDate}</p>
        {property.lastOpenNote && (
          <p className="text-orange-500 font-medium">{property.lastOpenNote}</p>
        )}
        <p className="text-gray-500 mt-1">Last Called Date:</p>
        <p className="font-semibold text-gray-900">{property.lastCalledDate}</p>
      </div>

      {/* 5. Offer Status / Source column (Next Steps + Assignments) */}
      <div className="min-w-0 text-[11px] leading-snug text-right">
        <p>
          <span className="font-bold text-orange-500">Next Steps: </span>
          <span className="text-gray-800 font-semibold">{property.nextSteps}</span>
        </p>
        <p className="mt-1">
          <span className="font-semibold text-gray-500">Offer Negotiator: </span>
          <span className="text-gray-900 font-semibold">{property.negotiator}</span>
        </p>
        <p>
          <span className="font-semibold text-gray-500">Assigned User: </span>
          <span
            className={`font-semibold ${
              property.assignedUser === "Not Assigned" ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {property.assignedUser}
          </span>
        </p>
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
function CaretDown() {
  return (
    <svg className="w-2.5 h-2.5 opacity-70" viewBox="0 0 10 10" fill="currentColor">
      <path d="M2 4 L5 7 L8 4 Z" />
    </svg>
  );
}
