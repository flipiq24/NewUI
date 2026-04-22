interface SegmentHeaderProps {
  label: string;
  count: number;
  subtitle: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  active?: boolean;
}

export default function SegmentHeader({ label, count, subtitle, borderColor, bgColor, textColor, active }: SegmentHeaderProps) {
  return (
    <div className={`mb-1 border-l-4 ${borderColor} ${bgColor} rounded-sm ${active ? "border-b-4 border-b-orange-500" : ""}`}>
      <div className="px-4 pt-1.5 pb-0.5">
        <span className={`text-xs font-bold tracking-wider ${textColor}`}>
          {label} ({count} properties)
        </span>
      </div>
      <div className="px-4 pb-1.5">
        <p className={`text-[11px] leading-snug ${textColor} opacity-80`}>{subtitle}</p>
      </div>
    </div>
  );
}
