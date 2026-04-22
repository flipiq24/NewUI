import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import PropertyRow from "@/components/iq/PropertyRow";
import SegmentHeader from "@/components/iq/SegmentHeader";
import { DEAL_REVIEW_PROPERTIES } from "@/lib/iq/mockData";
import { loadIqState, saveIqState } from "@/lib/iq/storage";

const segments = [
  {
    key: "ACTIVE_OFF_MARKET" as const,
    label: "ACTIVE & OFF MARKET",
    color: "bg-red-500",
    subtitle:
      "These are your highest-priority active and off-market properties. MUST call first. Follow up with text and email after the phone call is made.",
  },
  {
    key: "PENDING_BACKUP_HOLD" as const,
    label: "PENDING / BACKUP / HOLD",
    color: "bg-blue-600",
    subtitle:
      "These properties are in contract. Call the agent. Find out if the buyer is performing. Stay close until it's confirmed.",
  },
  {
    key: "CLOSED_EXPIRED_CANCELED" as const,
    label: "CLOSED / EXPIRED / CANCELED",
    color: "bg-gray-600",
    subtitle:
      "This property is no longer available — that's your opening. Find out who the buyer was, did it sell for more or less than your offer, and update the relationship. Then ask if they have any other properties coming up.",
  },
];

export default function IqDealReview() {
  const [, navigate] = useLocation();

  function handleNext() {
    const state = loadIqState() ?? { date: "" };
    saveIqState({ ...state, dealReviewComplete: true });
    navigate("/iq/daily-outreach");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar
          breadcrumb="Deal Review > 9 High Priority Deals > 3 Active & Off Market"
          nextTask="Pending / Backup / Hold"
          onNext={handleNext}
        />
        <TaskTipBlock
          task="Josh, you have a total of 9 High Priority deals. Start by calling the 3 Active & Off Market."
          tip="These are high priorities — you must call first, then send text and email."
        />

        <div className="flex-1 overflow-y-auto p-4">
          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-4 justify-end">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">2 Criticals</span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">3 Reminders</span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">1 Unseen</span>
          </div>

          {segments.map((seg) => {
            const props = DEAL_REVIEW_PROPERTIES.filter((p) => p.segment === seg.key);
            return (
              <div key={seg.key} className="mb-6">
                <SegmentHeader
                  label={seg.label}
                  count={props.length}
                  subtitle={seg.subtitle}
                  color={seg.color}
                />
                <div className="space-y-2">
                  {props.map((p) => (
                    <PropertyRow key={p.id} property={p} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 mt-4">
            <span className="text-xs text-gray-500">Showing 1 to 9 of 9 entries</span>
            <div className="flex items-center gap-2">
              <select className="text-xs border border-gray-200 rounded px-2 py-1">
                <option>5 / page</option>
                <option>10 / page</option>
              </select>
              <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50">Previous</button>
              <button className="text-xs bg-orange-500 text-white px-2.5 py-1 rounded font-medium">1</button>
              <button className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
