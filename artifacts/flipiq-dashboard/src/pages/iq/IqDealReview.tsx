import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import DealCard from "@/components/iq/DealCard";
import { DEAL_REVIEW_PROPERTIES, type DealLevel, type NotificationKind } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";
import { useStartGate } from "@/components/iq/useStartGate";
import { isPropertyComplete, setPropertyComplete, useChecklistVersion } from "@/lib/iq/dailyChecklist";

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

export default function IqDealReview() {
  const [, navigate] = useLocation();
  const [segIdx, setSegIdx] = useState(0);
  const segKey = `dealReview:${segments[segIdx].key}`;
  const { started, start } = useStartGate(segKey);

  const [activeLevel, setActiveLevel] = useState<DealLevel | null>(null);
  const [activeNotifications, setActiveNotifications] = useState<Set<NotificationKind>>(new Set());

  const currentSeg = segments[segIdx];
  const isLastSeg = segIdx === segments.length - 1;
  const nextLabel = isLastSeg ? "Agents" : segmentLabels[segments[segIdx + 1].key];

  // Subscribe to checklist changes so completion checkmarks update live
  const checklistVersion = useChecklistVersion();

  // Counts and per-level completion across the entire deal-review dataset
  const { levelCounts, levelComplete, notificationCounts, segmentCounts } = useMemo(() => {
    const lc: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    const ld: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    const nc: Record<NotificationKind, number> = { critical: 0, reminder: 0, unseen: 0, text: 0 };
    const sc: Record<string, number> = { ACTIVE_OFF_MARKET: 0, PENDING_BACKUP_HOLD: 0, CLOSED_EXPIRED_CANCELED: 0 };
    for (const p of DEAL_REVIEW_PROPERTIES) {
      lc[p.level] += 1;
      if (isPropertyComplete(p.id)) ld[p.level] += 1;
      for (const n of p.notifications) nc[n] += 1;
      sc[p.segment] = (sc[p.segment] ?? 0) + 1;
    }
    const complete: Record<DealLevel, boolean> = {
      high: lc.high > 0 && ld.high === lc.high,
      mid: lc.mid > 0 && ld.mid === lc.mid,
      low: lc.low > 0 && ld.low === lc.low,
      new: lc.new > 0 && ld.new === lc.new,
    };
    return { levelCounts: lc, levelComplete: complete, notificationCounts: nc, segmentCounts: sc };
  }, [checklistVersion]);

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

  const allSelected =
    visibleProps.length > 0 && visibleProps.every((p) => isPropertyComplete(p.id));

  function handleSelectAll(checked: boolean) {
    visibleProps.forEach((p) => setPropertyComplete(p.id, checked));
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
        <IqTopBar />

        {/* LLM-style chat briefing gate */}
        {!started && (
          <div className="flex-1 overflow-y-auto bg-white px-6 py-8">
            <div className="max-w-3xl flex flex-col gap-6">

              {/* AI message */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={`${import.meta.env.BASE_URL}flipiq-icon.png`}
                    alt="FlipiQ"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-[13px] font-semibold text-gray-700 leading-none">FlipiQ</span>
                </div>
                <div>
                  <p className="text-[14px] text-gray-800 leading-7 mb-5">
                    You have 9 High Priority deals that need your attention today. Work through each group in order and take action on every deal. Hit <span className="text-orange-500 font-medium">Get Started</span> when you're ready.
                  </p>
                  <div className="space-y-1.5 mb-6">
                    {[
                      { label: "Active & Off Market", count: segmentCounts.ACTIVE_OFF_MARKET },
                      { label: "Pending / Backup / Hold", count: segmentCounts.PENDING_BACKUP_HOLD },
                      { label: "Closed / Expired / Canceled", count: segmentCounts.CLOSED_EXPIRED_CANCELED },
                    ].map(({ label, count }, i) => (
                      <div key={label} className="flex items-center gap-2.5 text-[13px] text-gray-500">
                        <span className="text-[11px] text-gray-300 w-3 flex-shrink-0">{i + 1}.</span>
                        <span>{count} {label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={start}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
                    >
                      Get Started
                      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,3 11,8 6,13" /></svg>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Ask anything — pinned to bottom when gate is showing */}
        {!started && (
          <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-100">
            <div className="max-w-3xl flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-2.5 bg-white shadow-sm">
              <button className="w-5 h-5 rounded-full border-2 border-orange-500 bg-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer hover:bg-orange-50">
                <svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round" />
                  <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Ask anything…"
                className="flex-1 text-[13px] text-gray-700 placeholder-gray-300 bg-transparent outline-none"
              />
              <button className="w-6 h-6 rounded-full bg-gray-900 hover:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer">
                <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,3 11,8 6,13" /></svg>
              </button>
            </div>
          </div>
        )}

        {started && (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
              <span className="text-sm text-gray-500">
                Active Deals › 9 High Priority Deals ›{" "}
                <span className="font-semibold text-gray-800 underline decoration-orange-500 decoration-2 underline-offset-2">
                  {segmentLabels[currentSeg.key]}
                </span>
              </span>
            </div>
          </>
        )}

        {started && (
          <div className="flex-1 overflow-y-auto bg-white px-6 py-8">
            <div className="max-w-3xl flex flex-col gap-6">
              {/* AI message header */}
              <div className="flex items-center gap-2">
                <img
                  src={`${import.meta.env.BASE_URL}flipiq-icon.png`}
                  alt="FlipiQ"
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[13px] font-semibold text-gray-700 leading-none">FlipiQ</span>
              </div>

              {/* Section heading row: Select All (left) · Next Task (right) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
                      Select All
                    </span>
                  </label>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    <span className="text-orange-500 normal-case font-medium tracking-normal text-[12px]">
                      Next Task:
                    </span>
                    <span>{nextLabel}</span>
                    <svg className="w-3 h-3 text-orange-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,3 11,8 6,13" /></svg>
                  </button>
                </div>
                <hr className="border-t border-gray-200 mt-2 mb-3" />
                <p className="text-[14px] text-gray-800 leading-7">
                  {currentSeg.subtitle}
                </p>
              </div>

              {/* Property list */}
              {visibleProps.length === 0 ? (
                <div className="text-sm text-gray-500 py-8">
                  No properties match the current filters in this segment.
                </div>
              ) : (
                <div>
                  {visibleProps.map((p) => (
                    <DealCard key={p.id} property={p} />
                  ))}
                </div>
              )}

              {allLevelsDone && (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-green-700">
                    All levels complete — nice work, Josh.
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-xs font-semibold bg-orange-500 text-white px-3 py-1.5 rounded-full hover:bg-orange-600 cursor-pointer"
                  >
                    Continue to {nextLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <IqAskBar />
      </div>
    </div>
  );
}
