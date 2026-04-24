import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import {
  DAILY_OUTREACH_BUCKETS,
  DEAL_REVIEW_PROPERTIES,
  type DealLevel,
} from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState, loadIqState, allTasksComplete } from "@/lib/iq/storage";
import { AGENTS as RESPONSE_AGENTS } from "@/pages/iq/IqCampaignResponses";
import { isPropertyComplete, useChecklistVersion } from "@/lib/iq/dailyChecklist";
import { InboxIcon, UnreadPulseDot } from "@/components/iq/InboxBits";
import FlipiqLabel from "@/components/iq/FlipiqLabel";
import FindOutMore from "@/components/iq/FindOutMore";
import { FIND_OUT_MORE } from "@/lib/iq/findOutMoreContent";

const LEVEL_ORDER: DealLevel[] = ["priority", "high", "mid", "low", "new"];
const LEVEL_LABEL: Record<DealLevel, string> = {
  priority: "Priority",
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
  const [sendCampaigns, setSendCampaigns] = useState<"yes" | "no" | "later" | null>(null);

  const bucketCounts = DAILY_OUTREACH_BUCKETS.reduce<Record<string, number>>((acc, b) => {
    acc[b.id] = b.pendingToday;
    return acc;
  }, {});
  const bucketTotal = Object.values(bucketCounts).reduce((a, b) => a + b, 0);
  const bucketDot: Record<string, string> = {
    hot: "#B83A3A", warm: "#C58323", cold: "#2F86D6", unknown: "#9CA3AF",
  };
  const bucketLabel: Record<string, string> = {
    hot: "Hot", warm: "Warm", cold: "Cold", unknown: "Unknown",
  };

  function handleConfirm(choice: "yes" | "no" | "later") {
    if (answer === null) return;
    setSendCampaigns(choice);
    const state = resetIqStateIfNewDay();
    saveIqState({
      ...state,
      outreachCampaignSent: choice === "yes" ? true : state.outreachCampaignSent,
      morningCheckin: {
        canWorkFullDay: answer,
        sendCampaignsNow: choice,
        needsHelp: false,
        canSendOffers: true,
        canSendCampaigns: choice !== "no",
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

  const card = "bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex gap-3";
  const num = "text-[12px] text-gray-300 mt-[2px] flex-shrink-0 w-4 leading-none pt-0.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8">
      <div className="flex flex-col gap-4 w-full items-center">
        {/* 1. Commit */}
        <div className={card}>
          <span className={num}>1.</span>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">Morning Check-in</p>
              <h2 className="text-[15px] font-semibold text-gray-800 leading-snug">
                Are you able to <strong>commit a full day</strong> and complete all your tasks?
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAnswer(true)}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  answer === true
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setAnswer(false)}
                className={`flex-1 py-2 rounded-full text-sm font-semibold border transition-colors ${
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 resize-none bg-white"
            />
          </div>
        </div>

        {/* 2. Campaigns */}
        <div className={`${card} ${answer === null ? "opacity-50 pointer-events-none" : ""}`}>
          <span className={num}>2.</span>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">Today's Outreach</p>
              <h2 className="text-[15px] font-semibold text-gray-800 leading-snug">
                Do you want me to send out your <strong>email campaigns</strong> now?
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {(["hot", "warm", "cold", "unknown"] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 text-[12px] text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bucketDot[k] }} />
                  <span className="font-medium">{bucketLabel[k]}</span>
                  <span className="text-orange-500 font-semibold">{bucketCounts[k] ?? 0}</span>
                </span>
              ))}
              <span className="text-[12px] text-gray-400">
                · <span className="text-gray-700 font-medium">{bucketTotal}</span> agents
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleConfirm("yes")}
                className="flex-1 py-2 rounded-full text-sm font-semibold border bg-white text-orange-500 border-orange-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => handleConfirm("later")}
                className="flex-1 py-2 rounded-full text-sm font-semibold border bg-white text-orange-500 border-orange-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
              >
                I will send later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PriorityProps {
  priority: number;
  title: string;
  body: string;
  done?: boolean;
  items?: string[];
  footer?: React.ReactNode;
}

function highlightNumbers(text: string) {
  const parts = text.split(/(High Priority|\d[\d,]*)/gi);
  return parts.map((p, i) => {
    if (/^high priority$/i.test(p)) {
      return <span key={i} className="text-red-600 font-semibold">{p}</span>;
    }
    if (/^\d[\d,]*$/.test(p)) {
      return <span key={i} className="text-orange-500 font-semibold">{p}</span>;
    }
    return <span key={i}>{p}</span>;
  });
}

function Priority({ priority, title, body, done, items, footer }: PriorityProps) {
  return (
    <div className="flex gap-3">
      <span className="text-[12px] text-gray-300 mt-[2px] flex-shrink-0 w-4">{priority}.</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[13px] font-semibold text-gray-800">{title}</span>
          {done && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-600">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,8 7,12 13,4" />
              </svg>
              done
            </span>
          )}
        </div>
        <p className="text-[13px] text-gray-500 leading-6 mb-2">{body}</p>
        {items && items.length > 0 && (
          <div className="space-y-1">
            {items.map((line, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[13px] text-gray-500">
                {done ? (
                  <svg className="w-3 h-3 text-green-600 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3,8 7,12 13,4" />
                  </svg>
                ) : (
                  <span className="text-[11px] text-gray-300 w-3 flex-shrink-0">{i + 1}.</span>
                )}
                <span>{highlightNumbers(line)}</span>
              </div>
            ))}
          </div>
        )}
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
}

function InboxSample() {
  const [, navigate] = useLocation();
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
      <button
        onClick={() => navigate("/iq/inbox")}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer w-[150px] bg-white"
        title="Open Inbox"
      >
        <span className="relative flex-shrink-0 w-3.5 h-3.5 text-gray-500">
          <InboxIcon />
          <span className="absolute -top-0.5 -right-0.5">
            <UnreadPulseDot size={8} ring srLabel="Unread messages" />
          </span>
        </span>
        <span className="text-xs font-medium flex-1 text-left">Inbox</span>
      </button>
      <p className="text-[12px] text-gray-500 leading-snug flex-1">
        When agents reply, you'll see them light up here — open the{" "}
        <span className="text-orange-500 font-medium">Inbox</span> in the left sidebar.
      </p>
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

  const iqState = useMemo(() => loadIqState(), [checklistVersion, showCheckin]);
  const outreachFlag = !!iqState?.outreachCampaignSent;
  const responsesFlag = !!iqState?.campaignResponsesComplete;
  const responseCounts = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    for (const a of RESPONSE_AGENTS) counts[a.section] += 1;
    return counts;
  }, []);
  const priorityFlag = !!iqState?.priorityAgentsComplete;
  const newRelFlag = !!iqState?.newRelationshipsComplete;
  const dayDone = !!iqState && allTasksComplete(iqState);

  function startStep(route: string) {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, flowStarted: true });
    navigate(route);
  }

  const { levelCounts, levelComplete } = useMemo(() => {
    const lc: Record<DealLevel, number> = { priority: 0, high: 0, mid: 0, low: 0, new: 0 };
    const ld: Record<DealLevel, number> = { priority: 0, high: 0, mid: 0, low: 0, new: 0 };
    for (const p of DEAL_REVIEW_PROPERTIES) {
      lc[p.level] += 1;
      if (isPropertyComplete(p.id)) ld[p.level] += 1;
    }
    const complete: Record<DealLevel, boolean> = {
      priority: lc.priority > 0 && ld.priority === lc.priority,
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
          <div className="w-full flex flex-col gap-6">

            {/* AI message */}
            <div>
              <div className="mb-3">
                <FlipiqLabel size="md" />
              </div>

              <p className="text-[14px] text-gray-800 leading-7 mb-3">
                Here are your <strong>tasks today</strong>, Josh. Work through them in priority order — hit{" "}
                <span className="text-orange-500 font-medium">Get Started</span> when you're ready.
              </p>

              <FindOutMore steps={FIND_OUT_MORE.TODAYS_PLAN.steps} className="mb-6" />

              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Today's Tasks:
              </p>

              <div className="flex flex-col gap-5">

                <Priority
                  priority={1}
                  title="Active Deals"
                  body={`These ${totalDeals} properties are your High Priority deals — Active & Off Market, Pending / Backup / Hold, and Closed / Expired / Canceled. Call the agent on each one. Work High first, then Mid, Low, and New, and update offer status as you go.`}
                  done={dealDone}
                  items={[
                    `${totalDeals} deals`,
                    ...LEVEL_ORDER.map((l) => `${levelCounts[l]} ${LEVEL_LABEL[l]}`),
                  ]}
                />

                <Priority
                  priority={2}
                  title="Agents › Text and Email Campaigns"
                  body={`Send today's outreach across Hot, Warm, Cold, and Unknown buckets — ${totalCampaigns} campaigns, ${totalEmails} emails total.`}
                  done={outreachFlag}
                  items={DAILY_OUTREACH_BUCKETS.map((b) => `${b.pendingToday} / ${b.totalDB} ${BUCKET_LABEL[b.id] ?? b.id}`)}
                  footer={<InboxSample />}
                />

                <Priority
                  priority={3}
                  title="Agents › Campaign Responses"
                  body="Work the agents who replied to today's campaigns — Positive first, then Neutral, then Negative — and apply the right follow-up to each."
                  done={responsesFlag}
                  items={[
                    `${responseCounts.positive} Positive Response`,
                    `${responseCounts.neutral} Neutral Response`,
                    `${responseCounts.negative} Negative Response`,
                  ]}
                />

                <Priority
                  priority={4}
                  title="Agents › Priority Calls"
                  body="Call your highest-value agents to keep relationships warm and move deals forward."
                  done={priorityFlag}
                  items={[`${totalPriorityAgents} priority agents to call`]}
                />

                <Priority
                  priority={5}
                  title="New Deals › New High Propensity to Sell Deals"
                  body="Reach out on owners likely to list soon to grow your agent network with fresh, high-intent leads."
                  done={newRelFlag}
                  items={[`${totalProperties} properties to call today`]}
                />

              </div>

              <div className="flex justify-end mt-6">
                {dayDone ? (
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
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

        <IqAskBar />
      </div>
    </div>
  );
}
