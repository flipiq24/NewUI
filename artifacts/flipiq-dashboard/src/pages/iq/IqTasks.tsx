import { useLocation } from "wouter";
import { ReactNode, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import {
  DAILY_OUTREACH_BUCKETS,
  DEAL_REVIEW_PROPERTIES,
  type DealLevel,
} from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState, loadIqState, allTasksComplete } from "@/lib/iq/storage";
import { isPropertyComplete, useChecklistVersion } from "@/lib/iq/dailyChecklist";

const LEVEL_META: Record<
  DealLevel,
  { label: string; color: string; border: string; tip: string }
> = {
  high: { label: "High", color: "text-red-500", border: "border-red-300", tip: "Highest-urgency deals — call these agents first today." },
  mid: { label: "Mid", color: "text-amber-500", border: "border-amber-300", tip: "Active conversations with solid recent engagement." },
  low: { label: "Low", color: "text-blue-500", border: "border-blue-300", tip: "Cooler deals — keep them moving with a touch today." },
  new: { label: "New", color: "text-gray-500", border: "border-gray-300", tip: "Brand-new or unworked deals — open the conversation." },
};
const LEVEL_ORDER: DealLevel[] = ["high", "mid", "low", "new"];

const bucketMeta: Record<string, { label: string; color: string; border: string; tip: string }> = {
  hot: { label: "High", color: "text-red-500", border: "border-red-300", tip: "High-urgency agents — recent strong engagement, high reply likelihood." },
  warm: { label: "Mid", color: "text-amber-500", border: "border-amber-300", tip: "Mid-tier agents — past engagement, worth re-engaging today." },
  cold: { label: "Low", color: "text-blue-500", border: "border-blue-300", tip: "Low-engagement agents — no recent activity, need a re-warm touch." },
  unknown: { label: "New", color: "text-gray-500", border: "border-gray-300", tip: "New agents — no engagement history yet." },
};

const pillTips: Record<NotificationKind, string> = {
  critical: "Critical alerts that require your immediate attention.",
  reminder: "Reminders you set or that the system queued for today.",
  unseen: "Unread emails from agents you've been working with.",
  text: "Unread text messages from agents.",
};

type NotificationKind = "critical" | "reminder" | "unseen" | "text";

interface NotificationPill {
  kind: NotificationKind;
  count: number;
  label: string;
}

interface CardProps {
  priority: number;
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  notifications?: NotificationPill[];
  children?: ReactNode;
  done?: boolean;
  interactive?: boolean;
}

function CardCheck() {
  return (
    <span
      title="Completed today"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-300 text-green-700 text-[11px] font-bold uppercase tracking-wide"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Done
    </span>
  );
}

function PillBadge({ pill }: { pill: NotificationPill }) {
  const styles = {
    critical: "bg-red-50 text-red-600 border-red-200",
    reminder: "bg-blue-50 text-blue-600 border-blue-200",
    unseen: "bg-green-50 text-green-600 border-green-200",
    text: "bg-purple-50 text-purple-600 border-purple-200",
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
    text: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 4 a1 1 0 0 1 1-1 h10 a1 1 0 0 1 1 1 v6 a1 1 0 0 1 -1 1 h-6 l-3 2.5 v-2.5 h-1 a1 1 0 0 1 -1 -1 z" />
      </svg>
    ),
  }[pill.kind];

  return (
    <span
      title={`${pill.count} ${pill.label} — ${pillTips[pill.kind]}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${styles} cursor-help`}
    >
      {icon}
      {pill.count} {pill.label}
    </span>
  );
}

function DashboardCard({ priority, title, subtitle, description, onClick, notifications, children, done, interactive = true }: CardProps) {
  const baseBorder = done ? "border-green-300" : "border-gray-200";
  const interactiveCls = interactive
    ? `cursor-pointer hover:shadow-md ${done ? "hover:border-green-400" : "hover:border-orange-300"}`
    : "cursor-default";
  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      title={interactive ? undefined : "Click Get Started below to begin your day"}
      aria-disabled={!interactive}
      className={`w-full text-left bg-white border rounded-xl shadow-sm p-5 transition-all block ${baseBorder} ${interactiveCls}`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">
            Priority #{priority}
          </p>
          {done && <CardCheck />}
        </div>
        <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-snug">{description}</p>
        <p className="text-xs text-gray-500 mt-1.5">{subtitle}</p>
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

function MorningCheckinPopup({ onDismiss }: { onDismiss: () => void }) {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [helpText, setHelpText] = useState("");

  function handleAnswer(val: boolean) {
    setAnswer(val);
  }

  function handleConfirm() {
    if (answer === null) return;
    const state = resetIqStateIfNewDay();
    saveIqState({
      ...state,
      morningCheckin: {
        canWorkFullDay: answer,
        needsHelp: false,
        canSendOffers: true,
        canSendCampaigns: true,
        canReviewNewDeals: true,
        workExplain: helpText,
        helpExplain: helpText,
        offersExplain: "",
        campaignsExplain: "",
        newDealsExplain: "",
      },
    });
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 flex flex-col gap-6">
        <div>
          <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-2">Morning Check-in</p>
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            Are you able to commit a full day and complete all your tasks?
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleAnswer(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
              answer === true
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
              answer === false
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
            }`}
          >
            No
          </button>
        </div>

        <textarea
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          placeholder="Explain or request any help…"
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 resize-none bg-white"
        />

        {answer !== null && (
          <button
            onClick={handleConfirm}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default function IqTasks() {
  const [, navigate] = useLocation();
  const checklistVersion = useChecklistVersion();
  const [showCheckin, setShowCheckin] = useState(() => {
    const s = loadIqState();
    return !s?.morningCheckin;
  });

  // Re-read persisted progress so badges reflect what's done today.
  // Tracked via checklistVersion so toggles inside Deal Review propagate here.
  const iqState = useMemo(() => loadIqState(), [checklistVersion]);
  const flowStarted = !!iqState?.flowStarted;
  const outreachFlag = !!iqState?.outreachCampaignSent;
  const priorityFlag = !!iqState?.priorityAgentsComplete;
  const newRelFlag = !!iqState?.newRelationshipsComplete;
  const dayDone = !!iqState && allTasksComplete(iqState);

  function startStep(route: string) {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, flowStarted: true });
    navigate(route);
  }

  // Subscribe to checklist updates so completion state reflects bilaterally
  // between this page and /iq/deal-review as properties get checked off.
  const { levelCounts, levelComplete } = useMemo(() => {
    const lc: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    const ld: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    for (const p of DEAL_REVIEW_PROPERTIES) {
      lc[p.level] += 1;
      if (isPropertyComplete(p.id)) ld[p.level] += 1;
    }
    const complete: Record<DealLevel, boolean> = {
      high: lc.high > 0 && ld.high === lc.high,
      mid: lc.mid > 0 && ld.mid === lc.mid,
      low: lc.low > 0 && ld.low === lc.low,
      new: lc.new > 0 && ld.new === lc.new,
    };
    return { levelCounts: lc, levelComplete: complete };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklistVersion]);

  const totalDeals = LEVEL_ORDER.reduce((s, l) => s + levelCounts[l], 0);
  const totalCampaigns = 4;
  const totalEmails = 5;
  const totalPriorityAgents = 9;
  const totalProperties = 30;

  // Card-level "DONE" only when every cell in that priority is complete.
  const dealDone = totalDeals > 0 && LEVEL_ORDER.every((l) => levelCounts[l] === 0 || levelComplete[l]);
  const outreachDone = outreachFlag; // 4 buckets sent in one shot today
  const priorityDone = priorityFlag; // single cell
  const newRelDone = newRelFlag; // single cell

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      {showCheckin && <MorningCheckinPopup onDismiss={() => setShowCheckin(false)} />}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar title="FlipiQ Assistant" />
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
                description="Follow up on your properties — High priority first, then Mid, Low, and finally New. Update the offer status as you go, and check your notifications for each property."
                subtitle={`Total Deals: ${totalDeals}`}
                onClick={() => startStep("/iq/deal-review")}
                done={dealDone}
                interactive={flowStarted}
                notifications={[
                  { kind: "critical", count: 2, label: "Criticals" },
                  { kind: "reminder", count: 4, label: "Reminders" },
                  { kind: "unseen", count: 1, label: "Unseen" },
                  { kind: "text", count: 3, label: "Texts" },
                ]}
              >
                <div className="grid grid-cols-4 gap-3">
                  {LEVEL_ORDER.map((level) => {
                    const meta = LEVEL_META[level];
                    const count = levelCounts[level];
                    const isDone = levelComplete[level];
                    const cls = isDone
                      ? "bg-green-50 border-green-300"
                      : `bg-white ${meta.border}`;
                    return (
                      <div
                        key={level}
                        title={`${meta.label} — ${count} ${count === 1 ? "deal" : "deals"}${
                          isDone ? " (all complete)" : ""
                        }. ${meta.tip}`}
                        className={`relative border ${cls} rounded-lg p-4 text-center cursor-help`}
                      >
                        {isDone && (
                          <svg
                            className="absolute top-1.5 right-1.5 w-4 h-4 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <p className={`text-3xl font-bold ${meta.color} leading-none mb-1`}>
                          {count}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                          {meta.label}
                        </p>
                      </div>
                    );
                  })}
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
                description="Send today's outreach emails across hot, warm, cold, and unknown agent buckets."
                subtitle={`${totalCampaigns} Campaigns • Total Emails: ${totalEmails}`}
                onClick={() => startStep("/iq/daily-outreach")}
                done={outreachDone}
                interactive={flowStarted}
              >
                <div className="grid grid-cols-4 gap-3">
                  {DAILY_OUTREACH_BUCKETS.map((b) => {
                    const c = bucketMeta[b.id];
                    const cellDone = outreachDone;
                    return (
                      <div
                        key={b.id}
                        title={`${c.label} — ${b.pendingToday} pending today out of ${b.totalDB} in database. ${c.tip}`}
                        className={`relative border ${cellDone ? "bg-green-50 border-green-300" : `bg-white ${c.border}`} rounded-lg p-4 text-center cursor-help`}
                      >
                        {cellDone && (
                          <svg
                            className="absolute top-1.5 right-1.5 w-4 h-4 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <p className={`text-3xl font-bold ${c.color} leading-none mb-1`}>
                          {b.pendingToday}
                          <span className="text-base text-gray-400 font-normal"> / {b.totalDB}</span>
                        </p>
                        <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                          {c.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </DashboardCard>

              <DashboardCard
                priority={3}
                title="Priority Agent Calls"
                description="Call your highest-value agents to keep relationships warm and deals moving."
                subtitle={`Total Priority: ${totalPriorityAgents}`}
                onClick={() => startStep("/iq/priority-agents")}
                done={priorityDone}
                interactive={flowStarted}
              >
                <div
                  title={`${totalPriorityAgents} priority agents to call today — your highest-value relationships flagged for a personal phone call.`}
                  className={`relative border rounded-lg p-5 text-center cursor-help ${priorityDone ? "bg-green-50 border-green-300" : "bg-white border-orange-300"}`}
                >
                  {priorityDone && (
                    <svg
                      className="absolute top-1.5 right-1.5 w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
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
                description="Reach out on high-propensity-to-sell properties to grow your agent network."
                subtitle={`Total Properties: ${totalProperties}`}
                onClick={() => startStep("/iq/new-relationships")}
                done={newRelDone}
                interactive={flowStarted}
              >
                <div
                  title={`${totalProperties} high-propensity-to-sell properties to call today — owners likely to list soon, great targets for new agent relationships.`}
                  className={`relative border rounded-lg p-5 text-center cursor-help ${newRelDone ? "bg-green-50 border-green-300" : "bg-white border-orange-300"}`}
                >
                  {newRelDone && (
                    <svg
                      className="absolute top-1.5 right-1.5 w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <p className="text-4xl font-bold text-orange-500 leading-none mb-1">
                    {totalProperties}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    Total Properties to Call Today
                  </p>
                </div>
              </DashboardCard>

            </div>

            <div className="mt-8 flex justify-center">
              {dayDone ? (
                <button
                  onClick={() => navigate("/")}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-base px-8 py-3 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  View End of Day Stats
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6,3 11,8 6,13" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => startStep("/iq/deal-review")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base px-8 py-3 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  Get Started
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6,3 11,8 6,13" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
