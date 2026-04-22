import { useLocation } from "wouter";
import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
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

interface CardProps {
  priority: number;
  title: string;
  subtitle: string;
  onClick: () => void;
  children: ReactNode;
}

function DashboardCard({ priority, title, subtitle, onClick, children }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-xl shadow-sm p-5 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer block"
    >
      <div className="mb-4">
        <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-1">
          Priority #{priority}
        </p>
        <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {children}
    </button>
  );
}

export default function IqTasks() {
  const [, navigate] = useLocation();

  function startStep(route: string) {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, flowStarted: true });
    navigate(route);
  }

  const totalDeals = dealCategories.reduce((s, c) => s + c.count, 0);
  const totalCampaigns = 4;
  const totalEmails = 5;
  const totalPriorityAgents = 9;
  const totalProperties = 30;

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

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Deal Review
            </p>
            <div className="mb-8">
              <DashboardCard
                priority={1}
                title="Deal Review"
                subtitle={`Total Deals: ${totalDeals}`}
                onClick={() => startStep("/iq/deal-review")}
              >
                <div className="grid grid-cols-4 gap-3">
                  {dealCategories.map((cat) => (
                    <div
                      key={cat.label}
                      className={`${cat.bg} border ${cat.border} rounded-lg p-4 text-center`}
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
              </DashboardCard>
            </div>

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Daily Outreach
            </p>
            <div className="space-y-4">

              <DashboardCard
                priority={2}
                title="Email Campaigns"
                subtitle={`${totalCampaigns} Campaigns • Total Emails: ${totalEmails}`}
                onClick={() => startStep("/iq/daily-outreach")}
              >
                <div className="grid grid-cols-4 gap-3">
                  {DAILY_OUTREACH_BUCKETS.map((b) => {
                    const c = bucketColors[b.id];
                    return (
                      <div
                        key={b.id}
                        className={`${c.bg} border ${c.border} rounded-lg p-4 text-center`}
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
              </DashboardCard>

              <DashboardCard
                priority={3}
                title="Priority Agent Calls"
                subtitle={`Total Priority: ${totalPriorityAgents}`}
                onClick={() => startStep("/iq/priority-agents")}
              >
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-center">
                  <p className="text-4xl font-bold text-orange-500 leading-none mb-1">
                    {totalPriorityAgents}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Priority Agents to Call
                  </p>
                </div>
              </DashboardCard>

              <DashboardCard
                priority={4}
                title="Build New Agent Relationships"
                subtitle={`Total Properties: ${totalProperties}`}
                onClick={() => startStep("/iq/new-relationships")}
              >
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-center">
                  <p className="text-4xl font-bold text-orange-500 leading-none mb-1">
                    {totalProperties}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Total Properties to Call Today
                  </p>
                </div>
              </DashboardCard>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
