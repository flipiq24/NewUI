import { useMemo } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import { DEAL_REVIEW_PROPERTIES, TODAYS_TASKS, type DealLevel } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, firstIncompleteRoute } from "@/lib/iq/storage";
import { isPropertyComplete, useChecklistVersion } from "@/lib/iq/dailyChecklist";

const LEVEL_LABELS: Record<DealLevel, string> = {
  high: "High",
  mid: "Mid",
  low: "Low",
  new: "New",
};
const LEVEL_ORDER: DealLevel[] = ["high", "mid", "low", "new"];

export default function IqWelcomeBack() {
  const [, navigate] = useLocation();
  const state = resetIqStateIfNewDay();

  const checklistVersion = useChecklistVersion();
  const levelProgress = useMemo(() => {
    const total: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    const done: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    for (const p of DEAL_REVIEW_PROPERTIES) {
      total[p.level] += 1;
      if (isPropertyComplete(p.id)) done[p.level] += 1;
    }
    return LEVEL_ORDER.map((l) => ({
      level: l,
      label: LEVEL_LABELS[l],
      total: total[l],
      done: done[l],
      complete: total[l] > 0 && done[l] === total[l],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistVersion]);

  const dealDone = state.dealReviewComplete ?? false;
  const outreachDone = state.outreachCampaignSent ?? false;
  const agentsDone = state.priorityAgentsComplete ?? false;
  const relsDone = state.newRelationshipsComplete ?? false;

  function handleStart() {
    navigate(firstIncompleteRoute(state));
  }

  const tasks = [
    {
      n: 1,
      done: dealDone,
      doneText: `You completed ${TODAYS_TASKS.properties.toLocaleString()} Properties, great job - Done`,
      pendingText: `You still have ${TODAYS_TASKS.properties.toLocaleString()} Properties you need to follow up on`,
    },
    {
      n: 2,
      done: outreachDone,
      doneText: `You completed Agent campaigns, great job - Done`,
      pendingText: `You still have ${TODAYS_TASKS.agentsToMessage} Agents you need to send text and emails to`,
    },
    {
      n: 3,
      done: agentsDone,
      doneText: `You called your Priority Agents, great job - Done`,
      pendingText: `You have ${TODAYS_TASKS.priorityAgentsToCall} Priority agents you need to call`,
    },
    {
      n: 4,
      done: relsDone,
      doneText: `You completed your High-propensity deals, great job - Done`,
      pendingText: `You have ${TODAYS_TASKS.highPropensityDeals} High-propensity deals to chase`,
    },
  ];

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar title="FlipiQ Assistant" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-2xl">
            <h1 className="text-[28px] font-bold text-orange-500 mb-8">Josh, welcome back!</h1>

            <div className="space-y-4 mb-10">
              {tasks.map((t) => (
                <div key={t.n}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-orange-500 flex-shrink-0">Task {t.n})</span>
                    {t.done ? (
                      <span className="text-sm text-gray-500">
                        {t.doneText.split(" - Done")[0]} -{" "}
                        <span className="text-green-600 font-semibold">Done ✓</span>
                      </span>
                    ) : (
                      <span className="text-sm text-gray-700">{t.pendingText}</span>
                    )}
                  </div>
                  {t.n === 1 && (
                    <div className="ml-12 mt-2 flex flex-wrap gap-2">
                      {levelProgress.map((lp) => (
                        <span
                          key={lp.level}
                          title={`${lp.label}: ${lp.done} of ${lp.total} complete`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                            lp.complete
                              ? "bg-green-50 border-green-300 text-green-700"
                              : lp.done > 0
                              ? "bg-orange-50 border-orange-300 text-orange-700"
                              : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          {lp.complete && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {lp.label} {lp.done}/{lp.total}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleStart}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Click here to get started!
              </button>
            </div>
          </div>
        </div>
        <IqAskBar />
      </div>
    </div>
  );
}
