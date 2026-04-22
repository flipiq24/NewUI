import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import AudienceCard from "@/components/iq/AudienceCard";
import { DAILY_OUTREACH_BUCKETS } from "@/lib/iq/mockData";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";

const SMS_TEMPLATES = ["Text - direct to agent test", "Text - follow up #1", "Text - follow up #2"];
const EMAIL_TEMPLATES = ["Email Direct to Agent - Weekly Campaigns", "Email - Monthly Update", "Email - Market Report"];

export default function IqDailyOutreach() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [smsChecked, setSmsChecked] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);
  const [smsTemplate, setSmsTemplate] = useState(SMS_TEMPLATES[0]);
  const [emailTemplate, setEmailTemplate] = useState(EMAIL_TEMPLATES[0]);

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

  const campaignsSent = 0;
  const totalCampaigns = 4;

  function handleSend() {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, outreachCampaignSent: true });
    toast({ title: "Campaign sent successfully!" });
    setTimeout(() => navigate("/iq/priority-agents"), 800);
  }

  function handleNext() {
    const state = resetIqStateIfNewDay();
    saveIqState({ ...state, outreachCampaignSent: true });
    navigate("/iq/priority-agents");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar
          breadcrumb="Daily Outreach > Send Text and Emails"
          nextTask="Call Priority Agents"
          onNext={handleNext}
        />
        <TaskTipBlock
          task="Josh, you have a total of 5 Agent relationships to send campaigns to today. Start by clicking the box of each group — Hot, Warm, Cold, Unknown — on the top right of each card. Then choose a template, or configure a custom SMS or email message."
          tip="You can choose from pending emails or send a custom email for each."
        />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">

            {/* Page header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campaign Configuration</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  You have a total of <strong className="text-gray-600">38</strong> agent relationships (Hot, Warm, Cold, Unknown)
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">CAMPAIGNS SENT</p>
                <p className="text-2xl font-bold text-blue-500 leading-none">
                  {campaignsSent}
                  <span className="text-base text-gray-400 font-normal"> / {totalCampaigns}</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-5">

              {/* 1. Select Audience */}
              <div className="mb-6">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  1. SELECT AUDIENCE
                </p>
                <div className="flex gap-3">
                  {DAILY_OUTREACH_BUCKETS.map((bucket) => (
                    <AudienceCard
                      key={bucket.id}
                      bucket={bucket}
                      selected={selected.has(bucket.id)}
                      onToggle={() => toggleBucket(bucket.id)}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Configure Message */}
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  2. CONFIGURE MESSAGE
                  {selectedCount > 0 && (
                    <span className="text-gray-400 normal-case font-normal ml-1">
                      (SENDS TO {selectedCount} AGENTS)
                    </span>
                  )}
                </p>

                <div className="grid grid-cols-3 divide-x divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">

                  {/* SMS Text */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sms-check"
                          checked={smsChecked}
                          onChange={(e) => setSmsChecked(e.target.checked)}
                          className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                        />
                        <label htmlFor="sms-check" className="flex items-center gap-1.5 cursor-pointer">
                          <SmsIcon />
                          <span className="text-sm font-bold text-gray-800">SMS Text</span>
                        </label>
                      </div>
                      <button className="text-gray-300 hover:text-gray-500 transition-colors">
                        <EyeIcon />
                      </button>
                    </div>
                    <select
                      value={smsTemplate}
                      onChange={(e) => setSmsTemplate(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-orange-400"
                    >
                      {SMS_TEMPLATES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Email */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="email-check"
                          checked={emailChecked}
                          onChange={(e) => setEmailChecked(e.target.checked)}
                          className="w-3.5 h-3.5 accent-orange-500 cursor-pointer"
                        />
                        <label htmlFor="email-check" className="flex items-center gap-1.5 cursor-pointer">
                          <MailIcon />
                          <span className="text-sm font-bold text-gray-800">Email</span>
                        </label>
                      </div>
                      <button className="text-gray-300 hover:text-gray-500 transition-colors">
                        <EyeIcon />
                      </button>
                    </div>
                    <select
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      disabled={!emailChecked}
                      className={`w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-orange-400 ${!emailChecked ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {EMAIL_TEMPLATES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Voicemail */}
                  <div className="p-4 opacity-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" disabled className="w-3.5 h-3.5 cursor-not-allowed" />
                        <div className="flex items-center gap-1.5">
                          <VoicemailIcon />
                          <span className="text-sm font-bold text-gray-800">Voicemail</span>
                          <span className="text-[9px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Soon</span>
                        </div>
                      </div>
                    </div>
                    <select disabled className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-400 cursor-not-allowed">
                      <option>General Check-in.mp3</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <InfoIcon />
                You are sending to <strong className="text-gray-800 ml-1">{selectedCount} Agents</strong>
              </p>
              <button
                onClick={handleSend}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                Send Campaign
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6,3 11,8 6,13" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function SmsIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1.5" width="14" height="10" rx="2" />
      <path d="M4 14l3-2.5" strokeLinecap="round" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="14" height="10" rx="1.5" />
      <polyline points="1,4 8,9.5 15,4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function VoicemailIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="4.5" cy="9" r="3" />
      <circle cx="11.5" cy="9" r="3" />
      <line x1="4.5" y1="12" x2="11.5" y2="12" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.5" fill="currentColor" />
    </svg>
  );
}
