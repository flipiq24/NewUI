import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import PropertyRow from "@/components/iq/PropertyRow";
import SegmentHeader from "@/components/iq/SegmentHeader";
import DealReviewHeader from "@/components/iq/DealReviewHeader";
import { DEAL_REVIEW_PROPERTIES, type DealLevel, type NotificationKind } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";
import { useStartGate } from "@/components/iq/useStartGate";
import { isPropertyComplete, useChecklistVersion } from "@/lib/iq/dailyChecklist";

const segments = [
  {
    key: "ACTIVE_OFF_MARKET" as const,
    label: "ACTIVE & OFF MARKET",
    borderColor: "border-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    subtitle:
      "These are your highest-priority active and off-market properties. MUST call first. Follow up with text and email after the phone call is made.",
  },
  {
    key: "PENDING_BACKUP_HOLD" as const,
    label: "PENDING / BACKUP / HOLD",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-800",
    subtitle:
      "These properties are in contract. Call the agent. Find out if the buyer is performing. Stay close until it's confirmed.",
  },
  {
    key: "CLOSED_EXPIRED_CANCELED" as const,
    label: "CLOSED / EXPIRED / CANCELED",
    borderColor: "border-red-400",
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    subtitle:
      "This property is no longer available — that's your opening. Find out who the buyer was, did it sell for more or less than your offer, and update the relationship. Then ask if they have any other properties coming up.",
  },
];

const segmentLabels: Record<typeof segments[number]["key"], string> = {
  ACTIVE_OFF_MARKET: "3 Active & Off Market",
  PENDING_BACKUP_HOLD: "Pending / Backup / Hold",
  CLOSED_EXPIRED_CANCELED: "Closed / Expired / Canceled",
};

const segmentTaskCopy: Record<typeof segments[number]["key"], { task: string; tip: string }> = {
  ACTIVE_OFF_MARKET: {
    task: "Josh, you have a total of 9 High Priority deals. Start by calling the 3 Active & Off Market.",
    tip: "These are high priorities — you must call first, then send text and email.",
  },
  PENDING_BACKUP_HOLD: {
    task: "Now review your Pending / Backup / Hold properties. Call the agent to confirm the buyer is performing.",
    tip: "Stay close until the deal is confirmed — protect your backup position.",
  },
  CLOSED_EXPIRED_CANCELED: {
    task: "These properties are no longer available — that's your opening. Find out what happened and update the relationship.",
    tip: "Ask if they have any other properties coming up.",
  },
};

const LEVEL_ORDER: DealLevel[] = ["high", "mid", "low", "new"];

function InfoDot() {
  return (
    <svg className="w-3 h-3 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="7" x2="8" y2="11.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="w-3 h-3 text-gray-500" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 3 h12 l-4.5 6 v4 l-3 1.5 v-5.5 z" />
    </svg>
  );
}

export default function IqDealReview() {
  const [, navigate] = useLocation();
  const [segIdx, setSegIdx] = useState(0);
  const segKey = `dealReview:${segments[segIdx].key}`;
  const { started, start } = useStartGate(segKey);

  const [activeLevel, setActiveLevel] = useState<DealLevel | null>(null);
  const [activeNotifications, setActiveNotifications] = useState<Set<NotificationKind>>(new Set());

  const currentSeg = segments[segIdx];
  const isLastSeg = segIdx === segments.length - 1;
  const nextLabel = isLastSeg ? "Daily Outreach" : segmentLabels[segments[segIdx + 1].key];

  // Subscribe to checklist changes so completion checkmarks update live
  const checklistVersion = useChecklistVersion();

  // Counts and per-level completion across the entire deal-review dataset
  const { levelCounts, levelComplete, notificationCounts } = useMemo(() => {
    const lc: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    const ld: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    const nc: Record<NotificationKind, number> = { critical: 0, reminder: 0, unseen: 0, text: 0 };
    for (const p of DEAL_REVIEW_PROPERTIES) {
      lc[p.level] += 1;
      if (isPropertyComplete(p.id)) ld[p.level] += 1;
      for (const n of p.notifications) nc[n] += 1;
    }
    const complete: Record<DealLevel, boolean> = {
      high: lc.high > 0 && ld.high === lc.high,
      mid: lc.mid > 0 && ld.mid === lc.mid,
      low: lc.low > 0 && ld.low === lc.low,
      new: lc.new > 0 && ld.new === lc.new,
    };
    return { levelCounts: lc, levelComplete: complete, notificationCounts: nc };
  }, [checklistVersion]);

  // Per-segment level breakdown — shown as a preview before Get Started is
  // clicked so the user sees what's in this step.
  const segLevelCounts = useMemo(() => {
    const lc: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    const ld: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    for (const p of DEAL_REVIEW_PROPERTIES) {
      if (p.segment !== currentSeg.key) continue;
      lc[p.level] += 1;
      if (isPropertyComplete(p.id)) ld[p.level] += 1;
    }
    return LEVEL_ORDER.map((l) => ({
      level: l,
      count: lc[l],
      done: lc[l] > 0 && ld[l] === lc[l],
    }));
  }, [currentSeg.key, checklistVersion]);
  const segTotal = segLevelCounts.reduce((s, x) => s + x.count, 0);

  const allLevelsDone = LEVEL_ORDER.every((l) => levelCounts[l] === 0 || levelComplete[l]);

  // One-time initial focus: when this segment first opens, point Josh at the
  // first level that still has work. After that, manual tab clicks are
  // respected — including clicking back to a completed level to review it,
  // or clearing the filter (null).
  const didInitFocus = useRef(false);
  useEffect(() => {
    if (didInitFocus.current) return;
    if (allLevelsDone) {
      didInitFocus.current = true;
      return;
    }
    const firstIncomplete = LEVEL_ORDER.find(
      (l) => levelCounts[l] > 0 && !levelComplete[l],
    );
    if (firstIncomplete) {
      setActiveLevel(firstIncomplete);
      didInitFocus.current = true;
    }
  }, [levelCounts, levelComplete, allLevelsDone]);

  // Auto-advance only on the transition where the *currently active* level
  // flips from incomplete to complete. This makes the checkmark "move along"
  // as Josh finishes a level, without overriding deliberate tab clicks.
  const prevActiveCompleteRef = useRef<boolean>(false);
  useEffect(() => {
    if (activeLevel === null) {
      prevActiveCompleteRef.current = false;
      return;
    }
    const isComplete = levelComplete[activeLevel];
    const wasComplete = prevActiveCompleteRef.current;
    prevActiveCompleteRef.current = isComplete;
    if (!wasComplete && isComplete && !allLevelsDone) {
      const startIdx = LEVEL_ORDER.indexOf(activeLevel);
      const nextIncomplete = LEVEL_ORDER.slice(startIdx + 1)
        .concat(LEVEL_ORDER.slice(0, startIdx))
        .find((l) => levelCounts[l] > 0 && !levelComplete[l]);
      if (nextIncomplete) setActiveLevel(nextIncomplete);
    }
  }, [activeLevel, levelComplete, levelCounts, allLevelsDone]);

  // Properties shown in the current segment, after applying filters
  const visibleProps = useMemo(() => {
    return DEAL_REVIEW_PROPERTIES.filter((p) => p.segment === currentSeg.key)
      .filter((p) => (activeLevel ? p.level === activeLevel : true))
      .filter((p) =>
        activeNotifications.size === 0
          ? true
          : p.notifications.some((n) => activeNotifications.has(n)),
      );
  }, [currentSeg.key, activeLevel, activeNotifications]);

  function handleLevelClick(l: DealLevel) {
    setActiveLevel((prev) => (prev === l ? null : l));
  }

  function handleNotificationClick(n: NotificationKind) {
    setActiveNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function handleNext() {
    if (isLastSeg) {
      const state = resetIqStateIfNewDay();
      saveIqState({ ...state, dealReviewComplete: true });
      navigate("/iq/daily-outreach");
    } else {
      setSegIdx(segIdx + 1);
      setActiveLevel(null);
      setActiveNotifications(new Set());
    }
  }

  const filterActive = activeLevel !== null || activeNotifications.size > 0;

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar
          breadcrumb={`Deal Review > 9 High Priority Deals > ${segmentLabels[currentSeg.key]}`}
          nextTask={nextLabel}
          onNext={handleNext}
        />
        <TaskTipBlock
          task={segmentTaskCopy[currentSeg.key].task}
          tip={segmentTaskCopy[currentSeg.key].tip}
          storageKey={segKey}
          onStart={start}
        />

        {!started && (
          <div className="px-4 pt-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {segmentLabels[currentSeg.key]}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {segTotal} {segTotal === 1 ? "property" : "properties"} in this step
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${currentSeg.borderColor} ${currentSeg.bgColor} ${currentSeg.textColor}`}
                >
                  {currentSeg.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {segLevelCounts.map(({ level, count, done }) => (
                  <div
                    key={level}
                    className={`rounded-lg border px-3 py-2 ${
                      count === 0
                        ? "border-gray-200 bg-gray-50 text-gray-400"
                        : done
                          ? "border-gray-200 bg-gray-100 text-gray-400"
                          : "border-gray-200 bg-white text-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        {level}
                      </p>
                      {done && (
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-gray-300 text-white text-[10px] font-bold leading-none">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className={`text-lg font-bold ${done ? "line-through" : ""}`}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {started && (
          <DealReviewHeader
            levelCounts={levelCounts}
            levelComplete={levelComplete}
            notificationCounts={notificationCounts}
            activeLevel={activeLevel}
            activeNotifications={activeNotifications}
            onLevelClick={handleLevelClick}
            onNotificationClick={handleNotificationClick}
          />
        )}

        {started && (
          <div className="flex-1 overflow-y-auto p-4">
            {filterActive && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">Filters:</span>
                {activeLevel && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                    {activeLevel.toUpperCase()}
                  </span>
                )}
                {Array.from(activeNotifications).map((n) => (
                  <span
                    key={n}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-700 capitalize"
                  >
                    {n}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setActiveLevel(null);
                    setActiveNotifications(new Set());
                  }}
                  className="text-[11px] text-gray-500 hover:text-gray-700 underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="mb-2">
              <SegmentHeader
                label={currentSeg.label}
                count={visibleProps.length}
                subtitle={currentSeg.subtitle}
                borderColor={currentSeg.borderColor}
                bgColor={currentSeg.bgColor}
                textColor={currentSeg.textColor}
              />
              {visibleProps.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-sm text-gray-500">
                  No properties match the current filters in this segment.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Column header row */}
                  <div
                    className="hidden md:grid items-center gap-4 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                    style={{
                      gridTemplateColumns:
                        "32px minmax(0,2.4fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)",
                    }}
                  >
                    <span />
                    <span className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        Property <InfoDot />
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-400 normal-case font-semibold">
                        <FilterIcon /> Segments
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      Price / Propensity <InfoDot />
                    </span>
                    <span className="inline-flex items-center gap-1">
                      Last Open / Called <InfoDot />
                    </span>
                    <span className="inline-flex items-center gap-1 justify-end">
                      Offer Status / Source <InfoDot />
                    </span>
                  </div>
                  {visibleProps.map((p, i) => (
                    <PropertyRow key={p.id} property={p} last={i === visibleProps.length - 1} />
                  ))}
                </div>
              )}
            </div>

            {allLevelsDone && (
              <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-300 rounded-lg px-4 py-3">
                <span className="text-sm font-semibold text-green-800">
                  All levels complete — nice work, Josh.
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-xs font-semibold bg-orange-500 text-white px-3 py-1.5 rounded hover:bg-orange-600"
                >
                  Continue to {nextLabel}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
