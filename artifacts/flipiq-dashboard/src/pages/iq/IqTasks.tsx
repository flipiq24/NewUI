import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskDashboardCard from "@/components/iq/TaskDashboardCard";
import { DAILY_OUTREACH_BUCKETS } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";

const dealCategories = [
  { label: "Priority", count: 9, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  { label: "Hot", count: 6, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  { label: "Warm", count: 4, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "Cold", count: 3, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
];

const bucketColors: Record<string, { color: string; bg: string; border: string }> = {
  hot: { color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  warm: { color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  cold: { color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  unknown: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

export default function IqTasks() {
  const [, navigate] = useLocation();

  function startStep(route: string) {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, flowStarted: true });
    navigate(route);
  }

  const totalDeals = dealCategories.reduce((s, c) => s + c.count, 0);
  const totalCampaigns = DAILY_OUTREACH_BUCKETS.reduce((s, b) => s + b.pendingToday, 0);
  const priorityAgentCalls = 9;
  const newRelationshipProperties = 30;

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar title="FlipIQ Assistant" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-[28px] font-bold text-orange-500 mb-8">
              Here are your tasks today, Josh!
            </h1>

            {/* DEAL REVIEW SECTION */}
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Deal Review
            </p>
            <div className="mb-8">
              <TaskDashboardCard
                priority={1}
                title="Deal Review"
                subtitle={`Total Deals: ${totalDeals}`}
                onStart={() => startStep("/iq/deal-review")}
              >
                <div className="grid grid-cols-4 gap-3">
                  {dealCategories.map((cat) => (
                    <div
                      key={cat.label}
                      className={`${cat.bg} border ${cat.border} rounded-lg p-4 text-center cursor-default`}
                    >
                      <p className={`text-3xl font-bold ${cat.color} leading-none mb-1`}>
                        {cat.count}
                      </p>
                      <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                        {cat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </TaskDashboardCard>
            </div>

            {/* DAILY OUTREACH SECTION */}
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Daily Outreach
            </p>
            <div className="space-y-4">

              {/* Card 2 — Email Campaigns */}
              <TaskDashboardCard
                priority={2}
                title="Email Campaigns"
                subtitle={`${totalCampaigns} campaigns to send today`}
                onStart={() => startStep("/iq/daily-outreach")}
              >
                <div className="grid grid-cols-4 gap-3">
                  {DAILY_OUTREACH_BUCKETS.map((b) => {
                    const c = bucketColors[b.id];
                    return (
                      <div
                        key={b.id}
                        className={`${c.bg} border ${c.border} rounded-lg p-4 text-center cursor-default`}
                      >
                        <p className={`text-3xl font-bold ${c.color} leading-none mb-1`}>
                          {b.pendingToday}
                          <span className="text-base text-gray-400 font-normal"> / {b.totalDB}</span>
                        </p>
                        <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                          {b.id}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </TaskDashboardCard>

              {/* Card 3 — Priority Agent Calls */}
              <TaskDashboardCard
                priority={3}
                title="Priority Agent Calls"
                subtitle="Call your highest-priority agents"
                onStart={() => startStep("/iq/priority-agents")}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-5 text-center cursor-default">
                    <p className="text-4xl font-bold text-orange-500 leading-none mb-1">
                      {priorityAgentCalls}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      Priority Agents to call
                    </p>
                  </div>
                  <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-5 text-center cursor-default">
                    <p className="text-4xl font-bold text-red-500 leading-none mb-1">1</p>
                    <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      Critical
                    </p>
                  </div>
                  <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-5 text-center cursor-default">
                    <p className="text-4xl font-bold text-amber-500 leading-none mb-1">0</p>
                    <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      Reminders
                    </p>
                  </div>
                </div>
              </TaskDashboardCard>

              {/* Card 4 — Build New Agent Relationships */}
              <TaskDashboardCard
                priority={4}
                title="Build New Agent Relationships"
                subtitle="Chase high-propensity-to-sell properties"
                onStart={() => startStep("/iq/new-relationships")}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-5 text-center cursor-default">
                    <p className="text-4xl font-bold text-orange-500 leading-none mb-1">
                      {newRelationshipProperties}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      Total Properties to call today
                    </p>
                  </div>
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-5 text-center cursor-default">
                    <p className="text-4xl font-bold text-green-600 leading-none mb-1">22</p>
                    <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      High Propensity
                    </p>
                  </div>
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-5 text-center cursor-default">
                    <p className="text-4xl font-bold text-blue-500 leading-none mb-1">8</p>
                    <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      New Agents
                    </p>
                  </div>
                </div>
              </TaskDashboardCard>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
