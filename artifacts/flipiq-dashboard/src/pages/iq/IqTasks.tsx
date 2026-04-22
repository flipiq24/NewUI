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

interface NotificationPill {
  kind: "critical" | "reminder" | "unseen";
  count: number;
  label: string;
}

interface CardProps {
  priority: number;
  title: string;
  subtitle: string;
  onClick: () => void;
  notifications?: NotificationPill[];
  children: ReactNode;
}

function PillBadge({ pill }: { pill: NotificationPill }) {
  const styles = {
    critical: "bg-red-50 text-red-600 border-red-200",
    reminder: "bg-blue-50 text-blue-600 border-blue-200",
    unseen: "bg-gray-50 text-gray-600 border-gray-200",
  }[pill.kind];

  const icon = {
    critical: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2 L14 13 L2 13 Z" />
        <line x1="8" y1="6" x2="8" y2="9" />
        <circle cx="8" cy="11" r="0.5" fill="currentColor" />
      </svg>
    ),
    reminder: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7 a4 4 0 0 1 8 0 v3 l1.5 2 h-11 l1.5-2 z" />
        <path d="M6.5 13 a1.5 1.5 0 0 0 3 0" />
      </svg>
    ),
    unseen: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3.5" width="12" height="9" rx="1" />
        <path d="M2.5 4.5 L8 9 L13.5 4.5" />
      </svg>
    ),
  }[pill.kind];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${styles}`}>
      {icon}
      {pill.count} {pill.label}
    </span>
  );
}

function DashboardCard({ priority, title, subtitle, onClick, notifications, children }: CardProps) {
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
        {notifications && notifications.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mt-3">
            <span className="text-xs font-medium text-gray-600">Check notifications:</span>
            {notifications.map((pill, i) => (
              <PillBadge key={i} pill={pill} />
            ))}
          </div>
        )}
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
                notifications={[{ kind: "unseen", count: 1, label: "Unseen" }]}
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
                notifications={[
                  { kind: "critical", count: 2, label: "Criticals" },
                  { kind: "reminder", count: 4, label: "Reminders" },
                ]}
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
