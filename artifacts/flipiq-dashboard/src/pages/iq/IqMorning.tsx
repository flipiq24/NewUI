import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import {
  saveIqState,
  resetIqStateIfNewDay,
} from "@/lib/iq/storage";
import { DAILY_OUTREACH_BUCKETS } from "@/lib/iq/mockData";

export default function IqMorning() {
  const [, navigate] = useLocation();
  const [canWorkFullDay, setCanWorkFullDay] = useState<boolean | null>(null);
  const [sendCampaignsNow, setSendCampaignsNow] = useState<"yes" | "no" | "later" | null>(null);
  const [needsHelp, setNeedsHelp] = useState<boolean | null>(null);
  const [canSendOffers, setCanSendOffers] = useState<boolean | null>(null);
  const [canSendCampaigns, setCanSendCampaigns] = useState<boolean | null>(null);
  const [canReviewNewDeals, setCanReviewNewDeals] = useState<boolean | null>(null);
  const [workExplain, setWorkExplain] = useState("");
  const [helpExplain, setHelpExplain] = useState("");
  const [offersExplain, setOffersExplain] = useState("");
  const [campaignsExplain, setCampaignsExplain] = useState("");
  const [newDealsExplain, setNewDealsExplain] = useState("");

  const stateRef = useRef(resetIqStateIfNewDay());
  const state = stateRef.current;

  // Re-login same day: if morning check-in is already done, skip straight
  // to the tasks dashboard so the user can see their progress with checks.
  useEffect(() => {
    if (state.morningCheckin) {
      navigate("/iq/tasks");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allAnswered =
    canWorkFullDay !== null &&
    sendCampaignsNow !== null &&
    needsHelp !== null &&
    canSendOffers !== null &&
    canSendCampaigns !== null &&
    canReviewNewDeals !== null;

  function handleContinue() {
    saveIqState({
      ...state,
      morningCheckin: {
        canWorkFullDay: canWorkFullDay!,
        sendCampaignsNow,
        needsHelp: needsHelp!,
        canSendOffers: canSendOffers!,
        canSendCampaigns: canSendCampaigns!,
        canReviewNewDeals: canReviewNewDeals!,
        workExplain,
        helpExplain,
        offersExplain,
        campaignsExplain,
        newDealsExplain,
      },
    });
    navigate("/iq/tasks");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar title="FlipiQ Assistant" />
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-2xl">
            <h1 className="text-[28px] font-bold text-orange-500 mb-8">Good morning, Josh!</h1>

            <div className="space-y-6">
              <Question
                label="Are you able to work full day?"
                value={canWorkFullDay}
                onChange={setCanWorkFullDay}
                explain={workExplain}
                onExplainChange={setWorkExplain}
              />
              <CampaignQuestion
                value={sendCampaignsNow}
                onChange={setSendCampaignsNow}
              />
              <Question
                label="Do you need any help today?"
                value={needsHelp}
                onChange={setNeedsHelp}
                explain={helpExplain}
                onExplainChange={setHelpExplain}
                explainOn={true}
              />
              <Question
                label="Can you send out 5 offers today?"
                value={canSendOffers}
                onChange={setCanSendOffers}
                explain={offersExplain}
                onExplainChange={setOffersExplain}
              />
              <Question
                label="Can you send out your campaigns?"
                value={canSendCampaigns}
                onChange={setCanSendCampaigns}
                explain={campaignsExplain}
                onExplainChange={setCampaignsExplain}
              />
              <Question
                label="Can you go through the 30 new deals?"
                value={canReviewNewDeals}
                onChange={setCanReviewNewDeals}
                explain={newDealsExplain}
                onExplainChange={setNewDealsExplain}
              />
            </div>

            {allAnswered && (
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleContinue}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
        <IqAskBar />
      </div>
    </div>
  );
}

function Question({
  label,
  value,
  onChange,
  explain,
  onExplainChange,
  explainOn = false,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  explain: string;
  onExplainChange: (v: string) => void;
  explainOn?: boolean;
}) {
  const showExplain = value === explainOn;
  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
      <div className="flex items-start gap-3">
        <ToggleButton
          label="Yes"
          selected={value === true}
          onClick={() => onChange(true)}
        />
        <ToggleButton
          label="No"
          selected={value === false}
          onClick={() => onChange(false)}
        />
        {showExplain && (
          <textarea
            placeholder="Explain..."
            value={explain}
            onChange={(e) => onExplainChange(e.target.value)}
            rows={2}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 flex-1 bg-white resize-none"
          />
        )}
      </div>
    </div>
  );
}

function CampaignQuestion({
  value,
  onChange,
}: {
  value: "yes" | "no" | "later" | null;
  onChange: (v: "yes" | "no" | "later") => void;
}) {
  const counts = DAILY_OUTREACH_BUCKETS.reduce<Record<string, number>>((acc, b) => {
    acc[b.id] = b.pendingToday;
    return acc;
  }, {});
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const dotColor: Record<string, string> = {
    hot: "#B83A3A", warm: "#C58323", cold: "#2F86D6", unknown: "#9CA3AF",
  };
  const labels: Record<string, string> = {
    hot: "Hot", warm: "Warm", cold: "Cold", unknown: "Unknown",
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-2">
        Do you want me to send out your email campaigns now?
      </p>
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        {(["hot", "warm", "cold", "unknown"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-[12px] text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor[k] }} />
            <span className="font-medium">{labels[k]}</span>
            <span className="text-orange-500 font-semibold">{counts[k] ?? 0}</span>
          </span>
        ))}
        <span className="text-[12px] text-gray-400">
          · <span className="text-gray-700 font-medium">{total}</span> agents pending today
        </span>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <ToggleButton label="Yes" selected={value === "yes"} onClick={() => onChange("yes")} />
        <ToggleButton label="No" selected={value === "no"} onClick={() => onChange("no")} />
        <ToggleButton label="I will send later" selected={value === "later"} onClick={() => onChange("later")} />
      </div>
    </div>
  );
}

function ToggleButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
        selected
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-orange-500 border-orange-300 hover:bg-orange-50"
      }`}
    >
      {label}
    </button>
  );
}
