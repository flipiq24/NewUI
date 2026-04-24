import { useId, useState } from "react";

interface FindOutMoreProps {
  steps?: string[];
  videoSrc?: string;
  videoPoster?: string;
  label?: string;
  className?: string;
  inline?: boolean;
}

export default function FindOutMore({
  steps,
  videoSrc,
  videoPoster,
  label = "Find out more",
  className = "",
  inline = false,
}: FindOutMoreProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const hasSteps = !!steps && steps.length > 0;
  const hasContent = hasSteps || !!videoSrc;
  if (!hasContent) return null;

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      aria-controls={panelId}
      className="text-[12px] font-medium text-orange-500 hover:text-orange-600 underline underline-offset-2 cursor-pointer"
    >
      {label}{open ? "" : "…"}
    </button>
  );

  const panel = open ? (
    <div
      id={panelId}
      role="region"
      aria-label={label}
      className="mt-3 border border-orange-100 bg-orange-50/40 rounded-lg p-4 flex flex-col gap-4"
    >
      {hasSteps && (
        <ol className="flex flex-col gap-1.5">
          {steps!.map((s, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-700 leading-6">
              <span className="text-[11px] font-semibold text-orange-500 w-4 flex-shrink-0 mt-1">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="rounded-md overflow-hidden bg-gray-900 relative aspect-video max-w-md">
        {videoSrc ? (
          <video src={videoSrc} poster={videoPoster} controls className="w-full h-full" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 16 16" fill="currentColor">
                <polygon points="4,2 13,8 4,14" />
              </svg>
            </div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400">Walkthrough video coming soon</p>
          </div>
        )}
      </div>
    </div>
  ) : null;

  if (inline) {
    return (
      <>
        {trigger}
        {panel}
      </>
    );
  }

  return (
    <div className={className}>
      {trigger}
      {panel}
    </div>
  );
}
