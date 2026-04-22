interface TaskTipBlockProps {
  task: string;
  tip: string;
  showStartButton?: boolean;
  onStart?: () => void;
}

export default function TaskTipBlock({ task, tip, showStartButton, onStart }: TaskTipBlockProps) {
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
      {showStartButton && (
        <button
          onClick={onStart}
          className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer"
        >
          Get Started
        </button>
      )}
    </div>
  );
}
