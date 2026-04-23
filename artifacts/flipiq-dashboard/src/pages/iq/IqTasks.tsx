import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import {
  DAILY_OUTREACH_BUCKETS,
  DEAL_REVIEW_PROPERTIES,
  type DealLevel,
} from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState, loadIqState, allTasksComplete } from "@/lib/iq/storage";
import { isPropertyComplete, useChecklistVersion } from "@/lib/iq/dailyChecklist";

const LEVEL_ORDER: DealLevel[] = ["high", "mid", "low", "new"];
const LEVEL_LABEL: Record<DealLevel, string> = {
  high: "High",
  mid: "Mid",
  low: "Low",
  new: "New",
};
const BUCKET_LABEL: Record<string, string> = {
  hot: "High",
  warm: "Mid",
  cold: "Low",
  unknown: "New",
};

function MorningCheckinPopup({ onDismiss }: { onDismiss: () => void }) {
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [helpText, setHelpText] = useState("");

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
            onClick={() => setAnswer(true)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
              answer === true
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setAnswer(false)}
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

interface PriorityProps {
  priority: number;
  title: string;
  body: string;
  meta?: string;
  done?: boolean;
  children?: React.ReactNode;
}

function Priority({ priority, title, body, meta, done, children }: PriorityProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-medium text-orange-500">Priority #{priority}</span>
        {done && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3,8 7,12 13,4" />
            </svg>
            Done
          </span>
        )}
      </div>
      <p className="text-[14px] font-semibold text-gray-800 leading-snug mb-1">{title}</p>
      <p className="text-[13px] text-gray-600 leading-6 mb-2">{body}</p>
      {meta && (
        <p className="text-[12px] text-gray-400 mb-2">{meta}</p>
      )}
      {children}
    </div>
  );
}

function Chips({ items }: { items: { label: string; value: string | number; tone?: "default" | "muted" }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] ${
            it.tone === "muted"
              ? "border-gray-200 text-gray-500 bg-gray-50"
              : "border-gray-200 text-gray-700 bg-white"
          }`}
        >
          <span className="font-semibold text-gray-800">{it.value}</span>
          <span className="text-gray-500">{it.label}</span>
        </span>
      ))}
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

  const iqState = useMemo(() => loadIqState(), [checklistVersion]);
  const outreachFlag = !!iqState?.outreachCampaignSent;
  const priorityFlag = !!iqState?.priorityAgentsComplete;
  const newRelFlag = !!iqState?.newRelationshipsComplete;
  const dayDone = !!iqState && allTasksComplete(iqState);

  function startStep(route: string) {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, flowStarted: true });
    navigate(route);
  }

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
  const totalCampaigns = DAILY_OUTREACH_BUCKETS.length;
  const totalEmails = DAILY_OUTREACH_BUCKETS.reduce((s, b) => s + b.pendingToday, 0);
  const totalPriorityAgents = 9;
  const totalProperties = 30;

  const dealDone = totalDeals > 0 && LEVEL_ORDER.every((l) => levelCounts[l] === 0 || levelComplete[l]);

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      {showCheckin && <MorningCheckinPopup onDismiss={() => setShowCheckin(false)} />}
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar />

        <div className="flex-1 overflow-y-auto bg-white px-6 py-8">
          <div className="max-w-3xl flex flex-col gap-6">

            {/* AI message */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={`${import.meta.env.BASE_URL}flipiq-icon.png`}
                  alt="FlipiQ"
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[13px] font-semibold text-gray-700 leading-none">FlipiQ</span>
              </div>

              <p className="text-[14px] text-gray-800 leading-7 mb-6">
                Here are your tasks today, Josh. Work through them in priority order — hit{" "}
                <span className="text-orange-500 font-medium">Get Started</span> when you're ready.
              </p>

              <div className="flex flex-col gap-6">

                {/* Priority 1 — Deal Review */}
                <Priority
                  priority={1}
                  title="Deal Review"
                  body="Follow up on your properties — High first, then Mid, Low, and finally New. Update offer status as you go and check notifications for each property."
                  meta={`Total Deals: ${totalDeals}`}
                  done={dealDone}
                >
                  <div className="space-y-2">
                    <Chips
                      items={LEVEL_ORDER.map((l) => ({
                        label: LEVEL_LABEL[l],
                        value: levelCounts[l],
                      }))}
                    />
                    <Chips
                      items={[
                        { label: "Criticals", value: 2, tone: "muted" },
                        { label: "Reminders", value: 4, tone: "muted" },
                        { label: "Unseen", value: 1, tone: "muted" },
                        { label: "Texts", value: 3, tone: "muted" },
                      ]}
                    />
                  </div>
                </Priority>

                {/* Priority 2 — Email Campaigns */}
                <Priority
                  priority={2}
                  title="Email Campaigns"
                  body="Send today's outreach across Hot, Warm, Cold, and Unknown agent buckets."
                  meta={`${totalCampaigns} Campaigns • Total Emails: ${totalEmails}`}
                  done={outreachFlag}
                >
                  <Chips
                    items={DAILY_OUTREACH_BUCKETS.map((b) => ({
                      label: BUCKET_LABEL[b.id] ?? b.id,
                      value: `${b.pendingToday} / ${b.totalDB}`,
                    }))}
                  />
                </Priority>

                {/* Priority 3 — Priority Agent Calls */}
                <Priority
                  priority={3}
                  title="Priority Agent Calls"
                  body="Call your highest-value agents to keep relationships warm and deals moving."
                  meta={`Total Priority: ${totalPriorityAgents}`}
                  done={priorityFlag}
                >
                  <Chips items={[{ label: "Priority Agents to Call", value: totalPriorityAgents }]} />
                </Priority>

                {/* Priority 4 — New Relationships */}
                <Priority
                  priority={4}
                  title="Build New Agent Relationships"
                  body="Reach out on high-propensity-to-sell properties to grow your agent network."
                  meta={`Total Properties: ${totalProperties}`}
                  done={newRelFlag}
                >
                  <Chips items={[{ label: "Properties to Call Today", value: totalProperties }]} />
                </Priority>

              </div>

              <div className="flex justify-end mt-6">
                {dayDone ? (
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
                  >
                    View End of Day Stats
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,3 11,8 6,13" /></svg>
                  </button>
                ) : (
                  <button
                    onClick={() => startStep("/iq/deal-review")}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
                  >
                    Get Started
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,3 11,8 6,13" /></svg>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Ask anything — pinned to bottom */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-100">
          <div className="max-w-3xl flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-2.5 bg-white shadow-sm">
            <button className="w-5 h-5 rounded-full border-2 border-orange-500 bg-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer hover:bg-orange-50">
              <svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round" />
                <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Ask anything…"
              className="flex-1 text-[13px] text-gray-700 placeholder-gray-300 bg-transparent outline-none"
            />
            <button className="w-6 h-6 rounded-full bg-gray-900 hover:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer">
              <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,3 11,8 6,13" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
