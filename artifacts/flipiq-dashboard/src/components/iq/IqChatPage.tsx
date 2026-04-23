import { ReactNode } from "react";
import IqAskBar from "./IqAskBar";

interface IqChatPageProps {
  breadcrumbHead: string;
  breadcrumbTail: string;
  started: boolean;
  briefingMessage: ReactNode;
  briefingItems?: { label: string; count?: number | string }[];
  onStart: () => void;
  nextTaskLabel: string;
  onNextTask: () => void;
  instructions: ReactNode;
  children: ReactNode;
}

export default function IqChatPage({
  breadcrumbHead,
  breadcrumbTail,
  started,
  briefingMessage,
  briefingItems,
  onStart,
  nextTaskLabel,
  onNextTask,
  instructions,
  children,
}: IqChatPageProps) {
  if (!started) {
    return (
      <>
        <div className="flex-1 overflow-y-auto bg-white px-6 py-8">
          <div className="max-w-3xl flex flex-col gap-6">
            <FlipiQAvatar />
            <div>
              <p className="text-[14px] text-gray-800 leading-7 mb-5">
                {briefingMessage}{" "}
                Hit <span className="text-orange-500 font-medium">Get Started</span> when you're ready.
              </p>
              {briefingItems && briefingItems.length > 0 && (
                <div className="space-y-1.5 mb-6">
                  {briefingItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[13px] text-gray-500">
                      <span className="text-[11px] text-gray-300 w-3 flex-shrink-0">{i + 1}.</span>
                      <span>
                        {item.count !== undefined && (
                          <span className="text-orange-500 font-semibold">{item.count} </span>
                        )}
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={onStart}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
                >
                  Get Started
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6,3 11,8 6,13" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <IqAskBar />
      </>
    );
  }

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <span className="text-sm text-gray-500">
          {breadcrumbHead}{" "}
          <span className="font-semibold text-gray-800 underline decoration-orange-500 decoration-2 underline-offset-2">
            {breadcrumbTail}
          </span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-6 py-8">
        <div className="max-w-3xl flex flex-col gap-6">
          <FlipiQAvatar />

          <div>
            <div className="flex items-center justify-end">
              <button
                onClick={onNextTask}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider hover:text-orange-500 transition-colors cursor-pointer"
              >
                <span className="text-orange-500 normal-case font-medium tracking-normal text-[12px]">
                  Next Task:
                </span>
                <span>{nextTaskLabel}</span>
                <svg className="w-3 h-3 text-orange-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,3 11,8 6,13" />
                </svg>
              </button>
            </div>
            <hr className="border-t border-gray-200 mt-2 mb-3" />
            <p className="text-[14px] text-gray-800 leading-7">{instructions}</p>
          </div>

          {children}
        </div>
      </div>
      <IqAskBar />
    </>
  );
}

function FlipiQAvatar() {
  return (
    <div className="flex items-center gap-2">
      <img
        src={`${import.meta.env.BASE_URL}flipiq-icon.png`}
        alt="FlipiQ"
        className="w-6 h-6 object-contain"
      />
      <span className="text-[13px] font-semibold text-gray-700 leading-none">FlipiQ</span>
    </div>
  );
}
