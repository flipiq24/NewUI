import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import {
  saveIqState,
  resetIqStateIfNewDay,
} from "@/lib/iq/storage";

export default function IqMorning() {
  const [, navigate] = useLocation();
  const [canWorkFullDay, setCanWorkFullDay] = useState<boolean | null>(null);
  const [needsHelp, setNeedsHelp] = useState<boolean | null>(null);
  const [workExplain, setWorkExplain] = useState("");
  const [helpExplain, setHelpExplain] = useState("");

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

  const bothAnswered = canWorkFullDay !== null && needsHelp !== null;

  function handleContinue() {
    saveIqState({
      ...state,
      morningCheckin: {
        canWorkFullDay: canWorkFullDay!,
        needsHelp: needsHelp!,
        workExplain,
        helpExplain,
      },
    });
    navigate("/iq/tasks");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar title="FlipIQ Assistant" />
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
              <Question
                label="Do you need any help today?"
                value={needsHelp}
                onChange={setNeedsHelp}
                explain={helpExplain}
                onExplainChange={setHelpExplain}
              />
            </div>

            {bothAnswered && (
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
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  explain: string;
  onExplainChange: (v: string) => void;
}) {
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
        <textarea
          placeholder="Explain..."
          value={explain}
          onChange={(e) => onExplainChange(e.target.value)}
          rows={2}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 flex-1 bg-white resize-none"
        />
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
