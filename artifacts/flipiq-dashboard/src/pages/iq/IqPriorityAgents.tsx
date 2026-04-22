import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import AgentRecordCard from "@/components/iq/AgentRecordCard";
import { loadIqState, saveIqState } from "@/lib/iq/storage";

const TOTAL_AGENTS = 1;

export default function IqPriorityAgents() {
  const [, navigate] = useLocation();
  const [calledCount, setCalledCount] = useState(0);

  function handleNext() {
    const next = calledCount + 1;
    setCalledCount(next);
    if (next >= TOTAL_AGENTS) {
      const state = loadIqState() ?? { date: "" };
      saveIqState({ ...state, priorityAgentsComplete: true });
      navigate("/iq/new-relationships");
    }
  }

  function handleTopNext() {
    const state = loadIqState() ?? { date: "" };
    saveIqState({ ...state, priorityAgentsComplete: true });
    navigate("/iq/new-relationships");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar
          breadcrumb="Daily Outreach > Call Priority Agents"
          nextTask="Start New Relationship Building"
          onNext={handleTopNext}
        />
        <TaskTipBlock
          task="Josh, these are your high-priority relationships. Follow the next steps right below the agent's record information and click each of the checkboxes to get moving. If the agent doesn't respond, click Follow Up, make notes, then click Next Agent on the top for the next phone call."
          tip="Once you speak to the agent, based on the relationship, make sure you update the agent status."
        />

        <div className="flex-1 overflow-y-auto p-4">
          {/* Pagination bar */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5 mb-4">
            <span className="text-xs text-gray-600 font-medium">{TOTAL_AGENTS} Total Priority Agent{TOTAL_AGENTS !== 1 ? "s" : ""}</span>
            <div className="flex items-center gap-3">
              <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="8,2 4,6 8,10" />
                </svg>
                Previous Agent
              </button>
              <span className="text-xs text-gray-600 font-medium">
                Agents Called <span className="font-bold text-gray-900">{calledCount} of {TOTAL_AGENTS}</span>
              </span>
              <button
                onClick={handleNext}
                disabled={calledCount >= TOTAL_AGENTS}
                className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Agent
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="4,2 8,6 4,10" />
                </svg>
              </button>
            </div>
          </div>

          <AgentRecordCard />
        </div>
      </div>
    </div>
  );
}
