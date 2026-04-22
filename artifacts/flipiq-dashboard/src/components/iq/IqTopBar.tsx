import { useState } from "react";

interface IqTopBarProps {
  breadcrumb?: string;
  nextTask?: string | null;
  onNext?: () => void;
  title?: string;
  centerContent?: React.ReactNode;
  nextIncomplete?: boolean;
}

export default function IqTopBar({ breadcrumb, nextTask, onNext, title, centerContent, nextIncomplete }: IqTopBarProps) {
  const [showWarn, setShowWarn] = useState(false);

  function handleNextClick() {
    if (!onNext) return;
    const alreadyShown = typeof window !== "undefined" && sessionStorage.getItem("iqProcessWarnShown") === "1";
    if (nextIncomplete && !alreadyShown) {
      sessionStorage.setItem("iqProcessWarnShown", "1");
      setShowWarn(true);
    } else {
      onNext();
    }
  }

  function proceedAnyway() {
    setShowWarn(false);
    onNext?.();
  }

  return (
    <>
    <div className="min-h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 py-3 gap-6">
      <div className="flex items-center gap-3">
        {title && (
          <span className="text-base font-semibold text-gray-700">{title}</span>
        )}
        {breadcrumb && (() => {
          const idx = breadcrumb.lastIndexOf(">");
          const head = idx >= 0 ? breadcrumb.slice(0, idx + 1) : "";
          const tail = idx >= 0 ? breadcrumb.slice(idx + 1).trim() : breadcrumb;
          return (
            <span className="text-lg font-semibold text-gray-700">
              {head && <span>{head} </span>}
              <span className="underline decoration-orange-500 decoration-2 underline-offset-4">{tail}</span>
            </span>
          );
        })()}
      </div>
      {centerContent && (
        <div className="flex-1 flex justify-center">{centerContent}</div>
      )}
      {nextTask && (
        <div className="flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          aria-label="Go back"
          className="w-6 h-6 rounded flex items-center justify-center text-orange-500 hover:bg-orange-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10,3 5,8 10,13" />
          </svg>
        </button>
        <button
          onClick={handleNextClick}
          className={`text-xs flex items-center gap-1 ${onNext ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className="font-semibold text-orange-500">Next Task:</span>
          <span className="text-gray-600">{nextTask}</span>
          {onNext && (
            <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,3 11,8 6,13" />
            </svg>
          )}
        </button>
        </div>
      )}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 group">
          <span className="text-xs font-semibold text-orange-500 group-hover:text-orange-600 transition-colors">Need Help?</span>
          <span className="w-7 h-7 bg-orange-500 group-hover:bg-orange-600 rounded flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
    </div>
    {showWarn && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">Hold on, Josh.</h3>
              <p className="text-sm text-gray-600">You're not following the process. Make sure to follow it step by step — the system was designed for efficiency, not to be bypassed.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowWarn(false)}
              className="text-sm font-medium px-4 py-2 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Go back
            </button>
            <button
              onClick={proceedAnyway}
              className="text-sm font-semibold px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600"
            >
              Skip anyway
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
