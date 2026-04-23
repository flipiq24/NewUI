import { Fragment, useState } from "react";
import { useLocation } from "wouter";
import { useIqProgress, type IqProgressSegment } from "@/lib/iq/useIqProgress";

function currentSegmentKey(pathname: string): IqProgressSegment["key"] {
  if (pathname.startsWith("/iq/daily-outreach") || pathname.startsWith("/iq/priority-agents")) return "agents";
  if (pathname.startsWith("/iq/new-relationships")) return "new";
  if (pathname.startsWith("/iq/deal-review") || pathname.startsWith("/iq/tasks")) return "deals";
  return "plan";
}

export default function IqProgressStepper() {
  const [location, navigate] = useLocation();
  const segments = useIqProgress();
  const currentKey = currentSegmentKey(location);
  const currentIdx = segments.findIndex((s) => s.key === currentKey);

  const [hover, setHover] = useState<{ idx: number; kind: "label" | "number" } | null>(null);

  return (
    <div className="flex items-center pt-9">
      {segments.map((seg, i) => {
        const isCurrent = i === currentIdx;
        const isPast = i < currentIdx;
        const isUpcoming = i > currentIdx;
        const lineActive = i < segments.length - 1 && (seg.done || isPast || isCurrent);

        let circleClass = "";
        if (seg.done) {
          circleClass = "bg-white border-[1.5px] border-green-500 text-green-600";
        } else if (isCurrent) {
          circleClass = "bg-orange-500 border-[1.5px] border-orange-500 text-white";
        } else if (isPast) {
          circleClass = "bg-orange-500 border-[1.5px] border-orange-500 text-white";
        } else if (isUpcoming) {
          circleClass = "bg-gray-200 border-[1.5px] border-gray-200 text-gray-500";
        }

        const labelClass = isCurrent
          ? "text-gray-900 font-semibold"
          : seg.done || isPast
          ? "text-gray-500 font-normal"
          : "text-gray-400 font-normal";
        const activeTooltip =
          hover?.idx === i
            ? hover.kind === "label"
              ? seg.labelTooltip
              : seg.numberTooltip
            : null;

        return (
          <Fragment key={seg.key}>
            <div className="relative flex items-center justify-center">
              {/* Tooltip — anchored below the circle (stepper sits at the top of the page) */}
              {activeTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 pointer-events-none">
                  <Tooltip text={activeTooltip} />
                </div>
              )}
              {/* Label sits absolutely above the circle */}
              <div
                className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2"
                onMouseEnter={() => setHover({ idx: i, kind: "label" })}
                onMouseLeave={() => setHover(null)}
              >
                <span className={`text-[13px] tracking-tight whitespace-nowrap cursor-help ${labelClass}`}>
                  {seg.label}
                </span>
              </div>
              {/* Circle */}
              <div
                onMouseEnter={() => setHover({ idx: i, kind: "number" })}
                onMouseLeave={() => setHover(null)}
              >
                <button
                  onClick={() => navigate(seg.route)}
                  aria-label={`Go to ${seg.label}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold cursor-pointer transition-colors ${circleClass}`}
                >
                  {seg.done ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,8 7,12 13,4" />
                    </svg>
                  ) : (
                    seg.count
                  )}
                </button>
              </div>
            </div>
            {/* Connector — sits in the same flex row, vertically centered with circles, butted up against them */}
            {i < segments.length - 1 && (
              <div
                className={`h-[2px] w-32 -mx-px ${lineActive ? "bg-orange-500" : "bg-gray-200"}`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <div className="relative">
      {/* Upward tail */}
      <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-px">
        <div className="w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 translate-y-1/2" />
      </div>
      <div className="bg-white text-gray-700 text-[12px] leading-snug rounded-lg px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-200 w-[420px] max-w-[420px] whitespace-normal text-center">
        {text}
      </div>
    </div>
  );
}
