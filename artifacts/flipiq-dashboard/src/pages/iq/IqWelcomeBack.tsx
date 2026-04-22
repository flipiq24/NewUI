import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import { TODAYS_TASKS } from "@/lib/iq/mockData";
import { loadIqState, firstIncompleteRoute } from "@/lib/iq/storage";

export default function IqWelcomeBack() {
  const [, navigate] = useLocation();
  const state = loadIqState();

  const dealDone = state?.dealReviewComplete ?? false;
  const outreachDone = state?.outreachCampaignSent ?? false;
  const agentsDone = state?.priorityAgentsComplete ?? false;
  const relsDone = state?.newRelationshipsComplete ?? false;

  function handleStart() {
    if (!state) {
      navigate("/iq");
      return;
    }
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
        <IqTopBar title="FlipIQ Assistant" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-2xl">
            <h1 className="text-[28px] font-bold text-orange-500 mb-8">Josh, welcome back!</h1>

            <div className="space-y-4 mb-10">
              {tasks.map((t) => (
                <div key={t.n} className="flex items-baseline gap-2">
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
      </div>
    </div>
  );
}
