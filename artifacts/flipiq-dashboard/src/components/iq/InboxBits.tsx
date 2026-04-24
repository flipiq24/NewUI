export function InboxIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

interface UnreadPulseDotProps {
  size?: number;
  ring?: boolean;
  srLabel?: string;
}

export function UnreadPulseDot({ size = 8, ring = false, srLabel }: UnreadPulseDotProps) {
  const dim = `${size}px`;
  return (
    <span className="relative inline-flex" style={{ width: dim, height: dim }}>
      <span
        className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping"
        aria-hidden="true"
      />
      <span
        className={`relative inline-flex rounded-full bg-orange-500 ${ring ? "ring-2 ring-white" : ""}`}
        style={{ width: dim, height: dim }}
        aria-hidden="true"
      />
      {srLabel && <span className="sr-only">{srLabel}</span>}
    </span>
  );
}
