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
    <div className="flex items-center pt-12">
      {segments.map((seg, i) => {
        const isCurrent = i === currentIdx;
        const isPast = i < currentIdx;
        const isUpcoming = i > currentIdx;
        const lineActive = i < segments.length - 1 && (seg.done || isPast || isCurrent);

        let circleClass = "";
        if (seg.done) {
          circleClass = "bg-white border-2 border-green-500 text-green-600";
        } else if (isCurrent || isPast) {
          circleClass = "bg-orange-500 border-2 border-orange-500 text-white";
        } else if (isUpcoming) {
          circleClass = "bg-gray-300 border-2 border-gray-300 text-white";
        }

        const labelClass = seg.done || isCurrent || isPast ? "text-gray-700" : "text-gray-400";
        const activeTooltip =
          hover?.idx === i
            ? hover.kind === "label"
              ? seg.labelTooltip
              : seg.numberTooltip
            : null;

        return (
          <Fragment key={seg.key}>
            <div className="relative flex items-center justify-center">
              {/* Tooltip — anchored above the entire step so it always appears above the labels */}
              {activeTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none">
                  <Tooltip text={activeTooltip} />
                </div>
              )}
              {/* Label sits absolutely above the circle */}
              <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2"
                onMouseEnter={() => setHover({ idx: i, kind: "label" })}
                onMouseLeave={() => setHover(null)}
              >
                <span className={`text-[11px] font-medium whitespace-nowrap cursor-help ${labelClass}`}>
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
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold cursor-pointer transition-colors ${circleClass}`}
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
                className={`h-[2px] w-16 -mx-px ${lineActive ? "bg-orange-500" : "bg-gray-300"}`}
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
    <div className="bg-white text-gray-700 text-[11px] leading-snug rounded-md px-2.5 py-1.5 shadow-md border border-gray-200 w-56 text-center">
      {text}
    </div>
  );
}
