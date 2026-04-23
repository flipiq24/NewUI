import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqChatPage from "@/components/iq/IqChatPage";
import { DAILY_OUTREACH_BUCKETS } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";
import { useStartGate } from "@/components/iq/useStartGate";

const SMS_TEMPLATES = ["Text - direct to agent test", "Text - follow up #1", "Text - follow up #2"];
const EMAIL_TEMPLATES = ["Email Direct to Agent - Weekly Campaigns", "Email - Monthly Update", "Email - Market Report"];

const BUCKET_LABEL: Record<string, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
  unknown: "Unknown",
};

export default function IqDailyOutreach() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [smsChecked, setSmsChecked] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);
  const [smsTemplate, setSmsTemplate] = useState(SMS_TEMPLATES[0]);
  const [emailTemplate, setEmailTemplate] = useState(EMAIL_TEMPLATES[0]);
  const { started, start } = useStartGate("dailyOutreach");

  function toggleBucket(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedCount = DAILY_OUTREACH_BUCKETS
    .filter((b) => selected.has(b.id))
    .reduce((acc, b) => acc + b.pendingToday, 0);

  const totalAgents = DAILY_OUTREACH_BUCKETS.reduce((acc, b) => acc + b.pendingToday, 0);
  const totalCampaigns = 4;

  useEffect(() => {
    const state = resetIqStateIfNewDay();
    if (!state?.dealReviewComplete) {
      saveIqState({ ...state, dealReviewComplete: true });
    }
  }, []);

  function handleSend() {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, outreachCampaignSent: true });
    toast({ title: "Campaign sent successfully!" });
    setTimeout(() => navigate("/iq/campaign-responses"), 800);
  }

  function handleNext() {
    navigate("/iq/campaign-responses");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar />
        <IqChatPage
          breadcrumbHead="Agents ›"
          breadcrumbTail="Text and Email Campaigns"
          started={started}
          onStart={start}
          briefingMessage={
            <>
              Josh, you have a total of <span className="text-orange-500 font-semibold">{totalAgents}</span> Agent relationships to send campaigns to today across Hot, Warm, Cold and Unknown buckets. Pick your audience, choose a template, then send.
            </>
          }
          briefingItems={DAILY_OUTREACH_BUCKETS.map((b) => ({
            label: `${BUCKET_LABEL[b.id] ?? b.id} agents pending today`,
            count: b.pendingToday,
          }))}
          nextTaskLabel="Agents › Campaign Responses"
          onNextTask={handleNext}
          instructions={
            <>
              I recommend you send <span className="font-semibold">SMS + Email</span> to every group below — Hot, Warm, Cold, and Unknown — since none of them have been touched in over a month. Check off the audiences you want included today, pick a template for each channel, then hit Send Campaign.
            </>
          }
        >
          <div className="flex flex-col gap-8">

            {/* 1. Select Audience — flat list, no cards */}
            <section>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                1. Select Audience
              </p>
              <div className="flex flex-col">
                {DAILY_OUTREACH_BUCKETS.map((bucket, i) => {
                  const checked = selected.has(bucket.id);
                  return (
                    <label
                      key={bucket.id}
                      className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBucket(bucket.id)}
                        className="mt-1 w-3.5 h-3.5 accent-orange-500 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-[11px] text-gray-300 mt-1 w-3 flex-shrink-0">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-[13px] font-semibold text-gray-800">{bucket.label.replace(" AGENTS", " Agents")}</span>
                          <span className="text-[12px] text-gray-500">
                            <span className="text-orange-500 font-semibold">{bucket.pendingToday}</span> pending today
                            <span className="text-gray-300 mx-1.5">·</span>
                            {bucket.totalDB} in database
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          Last touched {bucket.lastCreated} · {bucket.lastTemplate}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* 2. Configure Message — flat checkbox rows, no cards */}
            <section>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                2. Configure Message
                {selectedCount > 0 && (
                  <span className="text-gray-400 normal-case font-normal ml-1.5 tracking-normal">
                    — sending to {selectedCount} agents
                  </span>
                )}
              </p>
              <div className="flex flex-col">
                {/* SMS row */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <input
                    type="checkbox"
                    id="sms-check"
                    checked={smsChecked}
                    onChange={(e) => setSmsChecked(e.target.checked)}
                    className="w-3.5 h-3.5 accent-orange-500 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="sms-check" className="text-[13px] font-semibold text-gray-800 w-24 cursor-pointer flex-shrink-0">
                    SMS Text
                  </label>
                  <select
                    value={smsTemplate}
                    onChange={(e) => setSmsTemplate(e.target.value)}
                    disabled={!smsChecked}
                    className={`flex-1 text-[13px] border-0 bg-transparent text-gray-700 focus:outline-none cursor-pointer ${!smsChecked ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {SMS_TEMPLATES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Email row */}
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <input
                    type="checkbox"
                    id="email-check"
                    checked={emailChecked}
                    onChange={(e) => setEmailChecked(e.target.checked)}
                    className="w-3.5 h-3.5 accent-orange-500 cursor-pointer flex-shrink-0"
                  />
                  <label htmlFor="email-check" className="text-[13px] font-semibold text-gray-800 w-24 cursor-pointer flex-shrink-0">
                    Email
                  </label>
                  <select
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    disabled={!emailChecked}
                    className={`flex-1 text-[13px] border-0 bg-transparent text-gray-700 focus:outline-none cursor-pointer ${!emailChecked ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {EMAIL_TEMPLATES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>

                {/* Voicemail row — disabled */}
                <div className="flex items-center gap-3 py-3 opacity-50">
                  <input type="checkbox" disabled className="w-3.5 h-3.5 cursor-not-allowed flex-shrink-0" />
                  <span className="text-[13px] font-semibold text-gray-800 w-24 flex-shrink-0 flex items-center gap-1.5">
                    Voicemail
                    <span className="text-[9px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Soon</span>
                  </span>
                  <span className="flex-1 text-[13px] text-gray-400">General Check-in.mp3</span>
                </div>
              </div>
            </section>

            {/* Send button — bottom right */}
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-gray-500">
                {selectedCount > 0 ? (
                  <>You're sending to <span className="font-semibold text-gray-800">{selectedCount} agents</span></>
                ) : (
                  <>Select at least one audience to enable sending.</>
                )}
              </p>
              <button
                onClick={handleSend}
                disabled={selectedCount === 0 || (!smsChecked && !emailChecked)}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                Send Campaign
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6,3 11,8 6,13" />
                </svg>
              </button>
            </div>

          </div>
        </IqChatPage>
      </div>
    </div>
  );
}

