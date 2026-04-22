import { useStartGate } from "./useStartGate";

interface TaskTipBlockProps {
  task: string;
  tip: string;
  storageKey?: string;
  onStart?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
}

export default function TaskTipBlock({
  task,
  tip,
  storageKey,
  onStart,
  onContinue,
  continueLabel,
}: TaskTipBlockProps) {
  const { started, start } = useStartGate(storageKey ?? "__none__");
  const showStart = !!storageKey && !started;
  const showContinue = !!storageKey && started && !!onContinue;

  function handleStart() {
    start();
    onStart?.();
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <div className="flex gap-2 mb-2">
        <span className="text-base font-bold text-orange-500 flex-shrink-0">Task:</span>
        <span className="text-base text-gray-800">{task}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-base font-bold text-blue-600 flex-shrink-0">Tip:</span>
        <span className="text-base text-gray-600">{tip}</span>
      </div>
      {(showStart || showContinue) && (
        <div className="flex justify-end mt-3">
          {showStart && (
            <button
              onClick={handleStart}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer"
            >
              Get Started
            </button>
          )}
          {showContinue && (
            <button
              onClick={onContinue}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer inline-flex items-center gap-1.5"
            >
              {continueLabel ? `Continue to ${continueLabel}` : "Continue"}
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="4,2 8,6 4,10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
