import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import PropertyRow from "@/components/iq/PropertyRow";
import SegmentHeader from "@/components/iq/SegmentHeader";
import { DEAL_REVIEW_PROPERTIES } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";
import { useStartGate } from "@/components/iq/useStartGate";

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

export default function IqDealReview() {
  const [, navigate] = useLocation();
  const [segIdx, setSegIdx] = useState(0);
  const segKey = `dealReview:${segments[segIdx].key}`;
  const { started, start } = useStartGate(segKey);

  const currentSeg = segments[segIdx];
  const isLastSeg = segIdx === segments.length - 1;
  const nextLabel = isLastSeg ? "Daily Outreach" : segmentLabels[segments[segIdx + 1].key];

  function handleNext() {
    if (isLastSeg) {
      const state = resetIqStateIfNewDay();
      saveIqState({ ...state, dealReviewComplete: true });
      navigate("/iq/daily-outreach");
    } else {
      setSegIdx(segIdx + 1);
    }
  }

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

        {started && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Filter chips — all same size with icons */}
          <div className="flex items-center gap-2 mb-4 justify-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 2L1.5 13.5h13L8 2z" />
                <line x1="8" y1="7" x2="8" y2="10" strokeLinecap="round" />
                <circle cx="8" cy="12" r="0.5" fill="currentColor" />
              </svg>
              2 Criticals
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 2a5 5 0 014.95 4.4C13.5 9.4 14.5 10.5 14.5 11.5H1.5c0-1 1-2.1 1.55-5.1A5 5 0 018 2z" />
                <line x1="6.5" y1="13.5" x2="9.5" y2="13.5" strokeLinecap="round" />
              </svg>
              3 Reminders
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" strokeLinecap="round" />
                <polyline points="1.5,4.5 8,9.5 14.5,4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              1 Unseen
            </span>
          </div>

          {(() => {
            const props = DEAL_REVIEW_PROPERTIES.filter((p) => p.segment === currentSeg.key);
            return (
              <div className="mb-2">
                <SegmentHeader
                  label={currentSeg.label}
                  count={props.length}
                  subtitle={currentSeg.subtitle}
                  borderColor={currentSeg.borderColor}
                  bgColor={currentSeg.bgColor}
                  textColor={currentSeg.textColor}
                />
                <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                  {props.map((p, i) => (
                    <PropertyRow key={p.id} property={p} last={i === props.length - 1} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 mt-4">
            <span className="text-xs text-gray-500">Showing 1 to 9 of 9 entries</span>
            <div className="flex items-center gap-2">
              <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600">
                <option>25 / page</option>
                <option>50 / page</option>
              </select>
              <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50">Previous</button>
              <button className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded font-medium">1</button>
              <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
