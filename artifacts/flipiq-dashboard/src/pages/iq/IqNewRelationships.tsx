import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import IqPropertyIntelligence from "@/components/iq/IqPropertyIntelligence";
import { NEW_RELATIONSHIPS_DEALS } from "@/lib/iq/mockData";
import { loadIqState, saveIqState } from "@/lib/iq/storage";

export default function IqNewRelationships() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [calledCount, setCalledCount] = useState(0);

  const total = NEW_RELATIONSHIPS_DEALS.length;
  const deal = NEW_RELATIONSHIPS_DEALS[currentIndex];

  function handleNext() {
    const next = currentIndex + 1;
    setCalledCount((c) => c + 1);
    if (next >= total) {
      const state = loadIqState() ?? { date: "" };
      saveIqState({ ...state, newRelationshipsComplete: true });
      toast({ title: "End of Day Stats coming soon!" });
      setTimeout(() => navigate("/iq/tasks"), 1200);
    } else {
      setCurrentIndex(next);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function handleTopNext() {
    const state = loadIqState() ?? { date: "" };
    saveIqState({ ...state, newRelationshipsComplete: true });
    toast({ title: "End of Day Stats coming soon!" });
    setTimeout(() => navigate("/iq/tasks"), 1200);
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar
          breadcrumb="Daily Outreach > Start New Relationships Building"
          nextTask="End of Day Stats"
          onNext={handleTopNext}
        />
        <TaskTipBlock
          task="Josh, great job following up with your properties and sending campaigns. Now it's time to chase high-propensity-to-sell properties with agents you already work with."
          tip="Look at the Propensity to Sell score in the top middle of the page and read the iQ Property Intelligence for instructions. Click on the address to enter the property and start making calls."
        />

        <div className="flex-1 overflow-y-auto p-4">
          {/* Counter bar */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 mb-4">
            <span className="text-xs text-gray-600 font-medium">
              <span className="font-bold text-gray-900">{calledCount} / {total}</span> new agent calls
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="8,2 4,6 8,10" />
                </svg>
                Previous Deal
              </button>
              <button
                onClick={handleNext}
                className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Next Deal
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="4,2 8,6 4,10" />
                </svg>
              </button>
            </div>
          </div>

          {/* Property card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 10h3v10h5v-5h4v5h5V10h3L12 2z" />
                </svg>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <h3 className="text-sm font-bold text-gray-900">{deal.address}</h3>
                  <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded flex-shrink-0 ${deal.badgeColor}`}>{deal.badge}</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-1">{deal.specs}</p>
                <p className="text-[11px] text-gray-400 mb-2">{deal.days}</p>
                <div className="flex flex-wrap gap-1 mb-1">
                  {deal.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{tag}</span>
                  ))}
                </div>
                <p className="text-[11px] text-orange-600 font-medium italic">{deal.agentNote}</p>
              </div>

              {/* Middle — Price / Propensity */}
              <div className="w-[150px] flex-shrink-0">
                <p className="text-lg font-bold text-gray-900 mb-0.5">{deal.price}</p>
                <p className="text-[11px] text-orange-600 font-semibold mb-1">
                  Propensity: {deal.propensityScore} | {deal.propensityLabel}
                </p>
                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${deal.propensityBadgeColor} mb-2 inline-block`}>
                  {deal.propensityBadge}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {deal.propensityTags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Right — Status */}
              <div className="w-[150px] flex-shrink-0">
                <InfoLine label="LOD" value={deal.lod} />
                <InfoLine label="LCD" value={deal.lcd} />
                <InfoLine label="Source" value={deal.source} />
                <div className="mt-2">
                  <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white w-full mb-1">
                    <option>{deal.offerStatus}</option>
                  </select>
                  <p className="text-[10px] text-orange-700 font-semibold">Next Steps: {deal.nextSteps}</p>
                </div>
              </div>
            </div>

            {/* iQ Property Intelligence */}
            {deal.iqIntelligence && (
              <IqPropertyIntelligence data={deal.iqIntelligence} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[10px] text-gray-500 mb-0.5">
      <span className="font-medium">{label}:</span> <span className="text-gray-700">{value}</span>
    </p>
  );
}
