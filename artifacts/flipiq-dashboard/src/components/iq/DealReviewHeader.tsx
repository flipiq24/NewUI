import type { DealLevel, NotificationKind } from "@/lib/iq/mockData";

const LEVEL_META: Record<
  DealLevel,
  { label: string; numColor: string; activeBorder: string; idleBorder: string; activeBg: string; doneTint: string }
> = {
  high: {
    label: "HIGH",
    numColor: "text-red-500",
    activeBorder: "border-red-400 ring-2 ring-red-200",
    idleBorder: "border-red-200",
    activeBg: "bg-red-50/60",
    doneTint: "bg-green-50 border-green-300",
  },
  mid: {
    label: "MID",
    numColor: "text-amber-500",
    activeBorder: "border-amber-400 ring-2 ring-amber-200",
    idleBorder: "border-amber-200",
    activeBg: "bg-amber-50/60",
    doneTint: "bg-green-50 border-green-300",
  },
  low: {
    label: "LOW",
    numColor: "text-blue-500",
    activeBorder: "border-blue-400 ring-2 ring-blue-200",
    idleBorder: "border-blue-200",
    activeBg: "bg-blue-50/60",
    doneTint: "bg-green-50 border-green-300",
  },
  new: {
    label: "NEW",
    numColor: "text-gray-500",
    activeBorder: "border-gray-400 ring-2 ring-gray-200",
    idleBorder: "border-gray-200",
    activeBg: "bg-gray-50/80",
    doneTint: "bg-green-50 border-green-300",
  },
};

const PILL_META: Record<
  NotificationKind,
  { label: (n: number) => string; idle: string; active: string; Icon: React.FC<{ className?: string }> }
> = {
  critical: {
    label: (n) => `${n} ${n === 1 ? "Critical" : "Criticals"}`,
    idle: "bg-red-100 text-red-700 border-red-200",
    active: "bg-red-500 text-white border-red-600",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 2L1.5 13.5h13L8 2z" />
        <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
        <circle cx="8" cy="12" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  reminder: {
    label: (n) => `${n} ${n === 1 ? "Reminder" : "Reminders"}`,
    idle: "bg-amber-100 text-amber-700 border-amber-200",
    active: "bg-amber-500 text-white border-amber-600",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 2a5 5 0 014.95 4.4C13.5 9.4 14.5 10.5 14.5 11.5H1.5c0-1 1-2.1 1.55-5.1A5 5 0 018 2z"
        />
        <line x1="6.5" y1="13.5" x2="9.5" y2="13.5" strokeLinecap="round" />
      </svg>
    ),
  },
  unseen: {
    label: (n) => `${n} Unseen`,
    idle: "bg-green-50 text-green-700 border-green-200",
    active: "bg-green-600 text-white border-green-700",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" strokeLinecap="round" />
        <polyline points="1.5,4.5 8,9.5 14.5,4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  text: {
    label: (n) => `${n} ${n === 1 ? "Text" : "Texts"}`,
    idle: "bg-purple-50 text-purple-700 border-purple-200",
    active: "bg-purple-600 text-white border-purple-700",
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.5 3.5h11a1 1 0 011 1v6a1 1 0 01-1 1H6.5l-3 2.5v-2.5h-1a1 1 0 01-1-1v-6a1 1 0 011-1z"
        />
      </svg>
    ),
  },
};

const LEVEL_ORDER: DealLevel[] = ["high", "mid", "low", "new"];
const PILL_ORDER: NotificationKind[] = ["critical", "reminder", "unseen", "text"];

type Props = {
  levelCounts: Record<DealLevel, number>;
  levelComplete: Record<DealLevel, boolean>;
  notificationCounts: Record<NotificationKind, number>;
  activeLevel: DealLevel | null;
  activeNotifications: Set<NotificationKind>;
  onLevelClick: (level: DealLevel) => void;
  onNotificationClick: (kind: NotificationKind) => void;
};

export default function DealReviewHeader({
  levelCounts,
  levelComplete,
  notificationCounts,
  activeLevel,
  activeNotifications,
  onLevelClick,
  onNotificationClick,
}: Props) {
  return (
    <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-200">
      {/* Notification pill filters */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 mr-1">Check notifications:</span>
        {PILL_ORDER.map((kind) => {
          const meta = PILL_META[kind];
          const count = notificationCounts[kind] ?? 0;
          const isActive = activeNotifications.has(kind);
          const Icon = meta.Icon;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => onNotificationClick(kind)}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                isActive ? meta.active : meta.idle
              } ${count === 0 ? "opacity-50" : ""}`}
              title={isActive ? "Click to clear filter" : `Filter to ${kind}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {meta.label(count)}
            </button>
          );
        })}
      </div>

      {/* 4 level filter cards */}
      <div className="grid grid-cols-4 gap-3">
        {LEVEL_ORDER.map((level) => {
          const meta = LEVEL_META[level];
          const count = levelCounts[level] ?? 0;
          const isActive = activeLevel === level;
          const isDone = levelComplete[level];
          const cls = isDone
            ? meta.doneTint
            : isActive
            ? `${meta.activeBorder} ${meta.activeBg}`
            : `${meta.idleBorder} bg-white`;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onLevelClick(level)}
              className={`relative border-2 rounded-lg p-4 text-center transition-all hover:shadow-sm ${cls}`}
              title={isActive ? "Click to clear filter" : `Filter to ${meta.label}`}
            >
              {isDone && (
                <svg
                  className="absolute top-2 right-2 w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              <p className={`text-3xl font-bold leading-none mb-1 ${meta.numColor}`}>{count}</p>
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{meta.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
