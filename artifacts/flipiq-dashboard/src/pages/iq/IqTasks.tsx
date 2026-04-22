import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import { TODAYS_TASKS } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";

const tasks = [
  { n: 1, prefix: "You have", count: TODAYS_TASKS.properties, suffix: "Properties you need to follow up on" },
  { n: 2, prefix: "You have", count: TODAYS_TASKS.agentsToMessage, suffix: "Agents you need to send text and emails to" },
  { n: 3, prefix: "You have", count: TODAYS_TASKS.priorityAgentsToCall, suffix: "Priority agents you need to call" },
  { n: 4, prefix: "You have", count: TODAYS_TASKS.highPropensityDeals, suffix: "High-propensity deals to chase" },
];

export default function IqTasks() {
  const [, navigate] = useLocation();

  function handleStart() {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, flowStarted: true });
    navigate("/iq/deal-review");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar title="FlipIQ Assistant" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-2xl">
            <h1 className="text-[28px] font-bold text-orange-500 mb-8">Here are your tasks today, Josh!</h1>

            <div className="space-y-4 mb-10">
              {tasks.map((t) => (
                <div key={t.n} className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-orange-500 flex-shrink-0">Task {t.n})</span>
                  <span className="text-sm text-gray-700">
                    {t.prefix}{" "}
                    <span className="font-bold text-gray-900">{t.count.toLocaleString()} {t.suffix.split(" ")[0]}</span>{" "}
                    {t.suffix.split(" ").slice(1).join(" ")}
                  </span>
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
