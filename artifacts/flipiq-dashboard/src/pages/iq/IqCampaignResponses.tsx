import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqChatPage from "@/components/iq/IqChatPage";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";
import { useStartGate } from "@/components/iq/useStartGate";

type Channel = "text" | "email" | "call";
type Basket = "High Value" | "Mid Value" | "Low Value" | "Clients" | "Unknown";
type Status = "Priority" | "Hot" | "Warm" | "Cold" | "Unknown";
type Sentiment = "positive" | "neutral" | "negative";

type AgentResponse = {
  name: string;
  office: string;
  phone: string;
  email: string;
  status: Status;
  basket: Basket;
  required: string;
  followStatus: string;
  followDate: string;
  isc: number | null;
  active: boolean;
  pbs: { total: number; p: number; b: number; s: number };
  channel: Channel;
  respondedAt: string;
  snippet: string;
  sentiment: Sentiment;
};

const AGENTS: AgentResponse[] = [
  {
    name: "Jose Ponce", office: "PONCE & PONCE REALTY, INC",
    phone: "909-266-0934", email: "joseponce909@yahoo.com",
    status: "Priority", basket: "High Value",
    required: "1 Critical", followStatus: "Relationship Built", followDate: "03/18/2026",
    isc: 19, active: true, pbs: { total: 57, p: 3, b: 0, s: 54 },
    channel: "call", respondedAt: "Today, 9:42a",
    snippet: "Got your text — call me back, I have one in Fontana you'll like.",
    sentiment: "positive",
  },
  {
    name: "Hadaly Khoum", office: "REALTY MASTERS & ASSOCIATES",
    phone: "909-767-9474", email: "hadalykhoum5268@gmail.com",
    status: "Hot", basket: "Mid Value",
    required: "1 Reminder · 1 Critical", followStatus: "Attempt 2", followDate: "04/07/2026",
    isc: 11, active: true, pbs: { total: 9, p: 1, b: 0, s: 8 },
    channel: "email", respondedAt: "Today, 8:15a",
    snippet: "Yes, send terms — buyer needs to close in 14 days.",
    sentiment: "positive",
  },
  {
    name: "Adam Rodell", office: "RE/MAX Select One",
    phone: "714-747-2117", email: "adamrodell@aol.com",
    status: "Warm", basket: "High Value",
    required: "—", followStatus: "Not Interested", followDate: "01/04/2026",
    isc: 4, active: true, pbs: { total: 18, p: 1, b: 0, s: 17 },
    channel: "text", respondedAt: "Yesterday, 6:11p",
    snippet: "Not now — try me again next quarter.",
    sentiment: "negative",
  },
  {
    name: "Jerry Macias", office: "Vida Real Estate",
    phone: "562-544-2413", email: "jerry@meetvida.com",
    status: "Unknown", basket: "Low Value",
    required: "—", followStatus: "N/A", followDate: "N/A",
    isc: 4, active: true, pbs: { total: 2, p: 0, b: 0, s: 2 },
    channel: "text", respondedAt: "Today, 7:48a",
    snippet: "What price range are you looking at?",
    sentiment: "neutral",
  },
  {
    name: "Belinda Sadberry", office: "Nelson Shelton & Associates",
    phone: "424-355-9140", email: "sadberryelite@gmail.com",
    status: "Hot", basket: "Low Value",
    required: "—", followStatus: "N/A", followDate: "N/A",
    isc: 4, active: true, pbs: { total: 1, p: 0, b: 0, s: 1 },
    channel: "email", respondedAt: "Yesterday, 4:02p",
    snippet: "Add me to your buy list — I'm in West LA.",
    sentiment: "positive",
  },
  {
    name: "Beberly Morales", office: "eXp Realty of California Inc",
    phone: "323-842-4154", email: "beberly.realestate@gmail.com",
    status: "Warm", basket: "Low Value",
    required: "—", followStatus: "N/A", followDate: "N/A",
    isc: 4, active: true, pbs: { total: 1, p: 1, b: 0, s: 0 },
    channel: "text", respondedAt: "Today, 10:21a",
    snippet: "Stop. Unsubscribe.",
    sentiment: "negative",
  },
  {
    name: "Peter Gillin", office: "—",
    phone: "—", email: "pdg@morganskenderian.com",
    status: "Unknown", basket: "Unknown",
    required: "—", followStatus: "N/A", followDate: "N/A",
    isc: 4, active: true, pbs: { total: 4, p: 3, b: 0, s: 1 },
    channel: "email", respondedAt: "Yesterday, 11:55a",
    snippet: "Who is this?",
    sentiment: "neutral",
  },
  {
    name: "Tony Diaz", office: "Flipiq",
    phone: "714-581-7805", email: "tony@flipiq.com",
    status: "Priority", basket: "Clients",
    required: "—", followStatus: "Attempt 5", followDate: "11/27/2025",
    isc: 2, active: false, pbs: { total: 0, p: 0, b: 0, s: 0 },
    channel: "call", respondedAt: "Yesterday, 5:30p",
    snippet: "Voicemail — call back about the Inland portfolio.",
    sentiment: "neutral",
  },
  {
    name: "Salvador Armijo", office: "CARNAVAL REALTY",
    phone: "626-290-0373", email: "salvadorarmijo007@gmail.com",
    status: "Hot", basket: "High Value",
    required: "—", followStatus: "Attempt 1", followDate: "01/23/2026",
    isc: null, active: true, pbs: { total: 3, p: 1, b: 0, s: 2 },
    channel: "text", respondedAt: "Today, 6:55a",
    snippet: "Send the address — let me run comps.",
    sentiment: "positive",
  },
  {
    name: "Christy Davenport", office: "COLDWELL BANKER REALTY",
    phone: "951-312-5017", email: "christydavenport1@yahoo.com",
    status: "Warm", basket: "Low Value",
    required: "—", followStatus: "Relationship Built", followDate: "04/02/2026",
    isc: null, active: true, pbs: { total: 4, p: 1, b: 0, s: 3 },
    channel: "email", respondedAt: "Yesterday, 2:14p",
    snippet: "Thanks Josh — keeping you in mind for my Riverside listings.",
    sentiment: "positive",
  },
  {
    name: "Susan Lubinbrownlie", office: "Coldwell Banker / Gay Dales",
    phone: "831-320-3001", email: "sbrownliecb@outlook.com",
    status: "Unknown", basket: "Unknown",
    required: "—", followStatus: "N/A", followDate: "N/A",
    isc: null, active: true, pbs: { total: 20, p: 2, b: 2, s: 16 },
    channel: "email", respondedAt: "Yesterday, 9:08a",
    snippet: "Auto-reply: Out of office through Monday.",
    sentiment: "neutral",
  },
];

const BASKET_RANK: Record<Basket, number> = {
  "High Value": 0, "Mid Value": 1, "Low Value": 2, "Clients": 3, "Unknown": 4,
};

const SORTED = [...AGENTS].sort((a, b) => {
  const ai = a.isc ?? -1, bi = b.isc ?? -1;
  if (bi !== ai) return bi - ai;
  return BASKET_RANK[a.basket] - BASKET_RANK[b.basket];
});

type SectionDef = {
  sentiment: Sentiment;
  tail: string;
  dot: string;
  text: string;
  blurb: string;
  actions: { key: string; label: string }[];
};

const SECTIONS: SectionDef[] = [
  {
    sentiment: "positive",
    tail: "Positive Response",
    dot: "#5C9A2A",
    text: "#27500A",
    blurb: "These agents are warm and asked for next steps. Move them into the deal pipeline today.",
    actions: [
      { key: "send-terms", label: "Send Terms & Address" },
      { key: "schedule-call", label: "Schedule Call" },
      { key: "add-priority", label: "Add to Priority Calls" },
      { key: "tag-hot", label: "Tag as Hot" },
    ],
  },
  {
    sentiment: "neutral",
    tail: "Neutral Response",
    dot: "#9CA3AF",
    text: "#4B5563",
    blurb: "These need a qualifier or context before they can move forward. Send a follow-up question.",
    actions: [
      { key: "qualifier", label: "Send Qualifying Question" },
      { key: "intro", label: "Send Intro / Context Reply" },
      { key: "remind-7", label: "Remind Me in 7 Days" },
      { key: "tag-warm", label: "Tag as Warm" },
    ],
  },
  {
    sentiment: "negative",
    tail: "Negative Response",
    dot: "#B83A3A",
    text: "#791F1F",
    blurb: "These declined or asked to stop. Suppress and reschedule the relationship for later.",
    actions: [
      { key: "unsubscribe", label: "Unsubscribe / Suppress" },
      { key: "tag-cold", label: "Tag as Cold" },
      { key: "remind-90", label: "Remind Me in 90 Days" },
      { key: "mark-not-interested", label: "Mark Not Interested" },
    ],
  },
];

// Same color language as Deal Review (high / mid / low) so the eye reads
// "value tier" the same way it does on properties.
const BASKET_COLOR: Record<Basket, { dot: string; text: string }> = {
  "High Value": { dot: "#5C9A2A", text: "#27500A" },
  "Mid Value":  { dot: "#C58323", text: "#854F0B" },
  "Low Value":  { dot: "#9CA3AF", text: "#4B5563" },
  "Clients":    { dot: "#2F86D6", text: "#185FA5" },
  "Unknown":    { dot: "#D1D5DB", text: "#6B7280" },
};

const STATUS_COLOR: Record<Status, { dot: string; text: string }> = {
  "Priority": { dot: "#D67432", text: "#9A3412" },
  "Hot":      { dot: "#B83A3A", text: "#791F1F" },
  "Warm":     { dot: "#C58323", text: "#854F0B" },
  "Cold":     { dot: "#2F86D6", text: "#185FA5" },
  "Unknown":  { dot: "#D1D5DB", text: "#6B7280" },
};

const CHANNEL_LABEL: Record<Channel, string> = {
  text: "SMS reply", email: "Email reply", call: "Inbound call",
};

function ChannelIcon({ c }: { c: Channel }) {
  if (c === "text") return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 3v-3H3a1 1 0 01-1-1V4z" />
    </svg>
  );
  if (c === "email") return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3.5" width="12" height="9" rx="1" />
      <polyline points="2.5,4.5 8,9 13.5,4.5" />
    </svg>
  );
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" />
    </svg>
  );
}

function Tip({ children, rows, title }: {
  children: ReactNode;
  title: string;
  rows: [string, string][];
}) {
  return (
    <span className="relative group cursor-help inline-block">
      {children}
      <div
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute z-50 left-0 top-full mt-1.5 w-[320px] bg-white border border-gray-200 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-3"
      >
        <p className="text-[10px] font-bold tracking-wider uppercase text-gray-400 mb-1.5">{title}</p>
        <div className="flex flex-col gap-1">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 text-[12px] leading-snug">
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-800 font-medium text-right">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </span>
  );
}

export default function IqCampaignResponses() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [selectedBySection, setSelectedBySection] = useState<Record<Sentiment, Set<string>>>({
    positive: new Set(),
    neutral: new Set(),
    negative: new Set(),
  });
  const [stepIdx, setStepIdx] = useState(0);
  const { started, start } = useStartGate("campaignResponses");

  function toggleSelect(sentiment: Sentiment, name: string) {
    setSelectedBySection((prev) => {
      const next = new Set(prev[sentiment]);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { ...prev, [sentiment]: next };
    });
  }
  function setSectionSelectAll(sentiment: Sentiment, names: string[], checked: boolean) {
    setSelectedBySection((prev) => ({
      ...prev,
      [sentiment]: checked ? new Set(names) : new Set(),
    }));
  }
  function applyBulkAction(sentiment: Sentiment, label: string) {
    const sel = selectedBySection[sentiment];
    if (sel.size === 0) {
      toast({ title: "Select agents first." });
      return;
    }
    setHandled((prev) => {
      const next = new Set(prev);
      sel.forEach((n) => next.add(n));
      return next;
    });
    setSelectedBySection((prev) => ({ ...prev, [sentiment]: new Set() }));
    toast({ title: `${label} applied to ${sel.size} agent${sel.size === 1 ? "" : "s"}.` });
  }

  useEffect(() => {
    const state = resetIqStateIfNewDay();
    const patch: Record<string, boolean> = {};
    if (!state?.dealReviewComplete) patch.dealReviewComplete = true;
    if (!state?.outreachCampaignSent) patch.outreachCampaignSent = true;
    if (Object.keys(patch).length > 0) saveIqState({ ...state, ...patch });
  }, []);

  function toggle(name: string) {
    setHandled((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const currentSec = SECTIONS[stepIdx];
  const isLastStep = stepIdx === SECTIONS.length - 1;
  const nextLabel = isLastStep
    ? "Agents › Priority Calls"
    : `Text and Email Campaigns › ${SECTIONS[stepIdx + 1].tail}`;

  function handleNext() {
    if (isLastStep) {
      navigate("/iq/priority-agents");
    } else {
      setStepIdx((i) => Math.min(i + 1, SECTIONS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar />
        <IqChatPage
          breadcrumbHead="Agents › Text and Email Campaigns ›"
          breadcrumbTail={currentSec.tail}
          started={started}
          onStart={start}
          briefingMessage={
            <>
              Josh, <span className="text-orange-500 font-semibold">{AGENTS.length}</span> agents responded to your text and email campaigns. We'll work them in three groups — <span className="font-semibold">Positive</span>, <span className="font-semibold">Neutral</span>, then <span className="font-semibold">Negative</span> — so each gets the right follow-up flow.
            </>
          }
          briefingItems={SECTIONS.map((s) => ({
            label: `${s.tail.toLowerCase()}`,
            count: SORTED.filter((a) => a.sentiment === s.sentiment).length,
          }))}
          nextTaskLabel={nextLabel}
          onNextTask={handleNext}
          instructions={
            <>
              <span className="font-semibold">Step {stepIdx + 1} of {SECTIONS.length} — {currentSec.tail}.</span>{" "}
              {currentSec.blurb} Select the agents you want to action, choose a bulk follow-up, then hit Next Task.
            </>
          }
        >
          {/* Step pills */}
          <div className="flex items-center gap-2 mb-1">
            {SECTIONS.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <button
                  key={s.sentiment}
                  type="button"
                  onClick={() => setStepIdx(i)}
                  disabled={i > stepIdx}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? "border-transparent text-white"
                      : done
                      ? "border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
                      : "border-gray-200 text-gray-300 cursor-not-allowed"
                  }`}
                  style={active ? { backgroundColor: s.dot } : undefined}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active ? "#fff" : s.dot }} />
                  {i + 1}. {s.tail}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-10">
            {SECTIONS.filter((_, i) => i === stepIdx).map((sec) => {
              const rows = SORTED.filter((a) => a.sentiment === sec.sentiment);
              const names = rows.map((r) => r.name);
              const sectionSel = selectedBySection[sec.sentiment];
              const allSelected = rows.length > 0 && rows.every((r) => sectionSel.has(r.name));
              const sectionHandledCount = rows.filter((r) => handled.has(r.name)).length;
              return (
                <section key={sec.sentiment}>
                  <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-gray-200">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: sec.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sec.dot }} />
                      {sec.tail}
                      <span className="text-[11px] text-gray-400 ml-1 font-normal">· {rows.length} agent{rows.length === 1 ? "" : "s"}</span>
                    </span>
                  </div>

                  {/* Per-section action bar */}
                  {rows.length > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => setSectionSelectAll(sec.sentiment, names, e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                          />
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
                            Select All
                          </span>
                        </label>
                        <SectionBulkActions
                          enabled={sectionSel.size > 0}
                          count={sectionSel.size}
                          actions={sec.actions}
                          onPick={(label) => applyBulkAction(sec.sentiment, label)}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        {sectionHandledCount} / {rows.length} handled
                      </span>
                    </div>
                  )}

                  {rows.length === 0 ? (
                    <p className="text-[12px] text-gray-400 italic py-2">No responses in this bucket today.</p>
                  ) : (
                    <div className="flex flex-col">
                      {rows.map((a, i) => {
                        const done = handled.has(a.name);
                        const isSelected = sectionSel.has(a.name);
                        const basket = BASKET_COLOR[a.basket];
                        const status = STATUS_COLOR[a.status];
                        const iscDisplay = a.isc === null ? "N/A" : a.isc.toString();
                        return (
                <div
                  key={a.name}
                  className={`flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 ${done ? "opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected || done}
                    onChange={() => (done ? toggle(a.name) : toggleSelect(sec.sentiment, a.name))}
                    className="mt-1.5 w-3.5 h-3.5 accent-orange-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-[11px] text-gray-300 mt-1.5 w-5 flex-shrink-0 text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    {/* Row 1 — name + meta pills */}
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <Tip
                        title="Agent Record"
                        rows={[
                          ["Office", a.office],
                          ["Phone", a.phone],
                          ["Email", a.email],
                          ["Assigned", "Josh Santos"],
                          ["Active in last 2y", a.active ? "Yes" : "No"],
                          ["Required action", a.required],
                          ["Follow-up status", a.followStatus],
                          ["Follow-up date", a.followDate],
                        ]}
                      >
                        <span className={`text-[14px] font-semibold ${done ? "line-through text-gray-400" : "text-gray-900 group-hover:text-orange-600"}`}>
                          {a.name}
                        </span>
                      </Tip>
                      <span className="text-[12px] text-gray-400">· {a.office}</span>

                      {/* Value pill — same logic as property high/mid/low */}
                      <Tip
                        title="Value Tier"
                        rows={[
                          ["Basket", a.basket],
                          ["Investor Source Count", iscDisplay],
                          ["Pending / Backup / Sold", `${a.pbs.p}P · ${a.pbs.b}B · ${a.pbs.s}S (${a.pbs.total})`],
                        ]}
                      >
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium" style={{ color: basket.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: basket.dot }} />
                          {a.basket}
                        </span>
                      </Tip>

                      <Tip
                        title="Relationship"
                        rows={[
                          ["Status", a.status],
                          ["Last follow-up", a.followStatus],
                          ["Date", a.followDate],
                        ]}
                      >
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium" style={{ color: status.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
                          {a.status}
                        </span>
                      </Tip>
                    </div>

                    {/* Row 2 — counts */}
                    <div className="flex items-center gap-3 text-[12px] text-gray-500 mb-1.5 flex-wrap">
                      <Tip
                        title="Investor Source Count"
                        rows={[
                          ["ISC", iscDisplay],
                          ["What it means", "Number of investor deals this agent has been the source for."],
                        ]}
                      >
                        <span>
                          ISC{" "}
                          <span className="text-orange-500 font-semibold">{iscDisplay}</span>
                        </span>
                      </Tip>
                      <span className="text-gray-300">·</span>
                      <Tip
                        title="Deal Mix"
                        rows={[
                          ["Pending", String(a.pbs.p)],
                          ["Backup", String(a.pbs.b)],
                          ["Sold", String(a.pbs.s)],
                          ["Total transactions", String(a.pbs.total)],
                        ]}
                      >
                        <span>
                          <span className="text-gray-700 font-medium">{a.pbs.total}</span> deals
                          <span className="text-gray-300 mx-1.5">·</span>
                          {a.pbs.p}P · {a.pbs.b}B · {a.pbs.s}S
                        </span>
                      </Tip>
                      <span className="text-gray-300">·</span>
                      <span className="inline-flex items-center gap-1.5 text-gray-500">
                        <ChannelIcon c={a.channel} />
                        {CHANNEL_LABEL[a.channel]} · {a.respondedAt}
                      </span>
                    </div>

                    {/* Row 3 — reply snippet */}
                    <p className="text-[13px] text-gray-600 leading-snug italic">
                      "{a.snippet}"
                    </p>
                  </div>
                </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[13px] text-gray-500">
              <span className="font-semibold text-gray-800">{handled.size}</span> of {AGENTS.length} responses handled across all groups
            </p>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
            >
              {isLastStep ? "Continue to Priority Calls" : `Next: ${SECTIONS[stepIdx + 1].tail}`}
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6,3 11,8 6,13" />
              </svg>
            </button>
          </div>
        </IqChatPage>
      </div>
    </div>
  );
}

function SectionBulkActions({
  enabled,
  count,
  actions,
  onPick,
}: {
  enabled: boolean;
  count: number;
  actions: { key: string; label: string }[];
  onPick: (label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={!enabled}
        onClick={() => setOpen((v) => !v)}
        className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
          enabled
            ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        Bulk Actions{enabled ? ` · ${count}` : ""}
      </button>
      {open && enabled && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 min-w-[220px]">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => {
                onPick(a.label);
                setOpen(false);
              }}
              className="w-full text-left px-3.5 py-2 text-[13px] text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
