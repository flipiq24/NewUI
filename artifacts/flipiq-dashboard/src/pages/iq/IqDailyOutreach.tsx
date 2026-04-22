import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import TaskTipBlock from "@/components/iq/TaskTipBlock";
import AudienceCard from "@/components/iq/AudienceCard";
import { DAILY_OUTREACH_BUCKETS } from "@/lib/iq/mockData";
import { loadIqState, saveIqState } from "@/lib/iq/storage";

export default function IqDailyOutreach() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [smsChecked, setSmsChecked] = useState(true);
  const [emailChecked, setEmailChecked] = useState(false);

  function toggleBucket(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedCount = DAILY_OUTREACH_BUCKETS.filter((b) => selected.has(b.id)).reduce((acc, b) => acc + b.pendingToday, 0);

  function handleSend() {
    const state = loadIqState() ?? { date: "" };
    saveIqState({ ...state, outreachCampaignSent: true });
    toast({ title: "Campaign sent successfully!" });
    setTimeout(() => navigate("/iq/priority-agents"), 800);
  }

  function handleNext() {
    const state = loadIqState() ?? { date: "" };
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

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">Campaign Configuration</p>
                <p className="text-xs text-gray-500">You have a total of 38 agent relationships (Hot, Warm, Cold, Unknown)</p>
              </div>
              <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Campaigns Sent</span>
                <span className="text-sm font-bold text-gray-900">0 / 4</span>
              </div>
            </div>

            <div className="p-5">
              {/* 1. Select Audience */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                  <span className="text-sm font-bold text-gray-900">Select Audience</span>
                </div>
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
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">2</div>
                  <span className="text-sm font-bold text-gray-900">
                    Configure Message
                    <span className="text-gray-400 font-normal ml-1">(Sends to {selectedCount} Agents)</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4">
                  {/* SMS */}
                  <div className={`rounded-lg border-2 p-3 ${smsChecked ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={smsChecked}
                        onChange={(e) => setSmsChecked(e.target.checked)}
                        className="accent-orange-500"
                      />
                      <span className="text-xs font-bold text-gray-800">SMS Text</span>
                    </div>
                    <select className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white">
                      <option>Text - direct to agent test</option>
                    </select>
                    <button className="mt-2 text-[10px] text-orange-500 hover:underline flex items-center gap-1">
                      <EyeIcon /> Preview
                    </button>
                  </div>

                  {/* Email */}
                  <div className={`rounded-lg border-2 p-3 ${emailChecked ? "border-orange-500 bg-orange-50" : "border-gray-200 opacity-70"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={emailChecked}
                        onChange={(e) => setEmailChecked(e.target.checked)}
                        className="accent-orange-500"
                      />
                      <span className="text-xs font-bold text-gray-800">Email</span>
                    </div>
                    <select className={`w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white ${!emailChecked ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!emailChecked}>
                      <option>Email Direct to Agent - Weekly Campaigns</option>
                    </select>
                  </div>

                  {/* Voicemail */}
                  <div className="rounded-lg border-2 border-gray-200 opacity-50 p-3 cursor-not-allowed">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="checkbox" disabled className="accent-orange-500" />
                      <span className="text-xs font-bold text-gray-800">Voicemail</span>
                      <span className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">SOON</span>
                    </div>
                    <select disabled className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white cursor-not-allowed">
                      <option>Not available yet</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  You are sending to <span className="font-bold text-gray-800">{selectedCount} Agents</span>.
                </p>
                <button
                  onClick={handleSend}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  Send Campaign
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,3 11,8 6,13" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" />
      <circle cx="6" cy="6" r="1.5" />
    </svg>
  );
}
