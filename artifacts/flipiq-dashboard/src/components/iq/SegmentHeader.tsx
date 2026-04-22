interface SegmentHeaderProps {
  label: string;
  count: number;
  subtitle: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

export default function SegmentHeader({ label, count, subtitle, borderColor, bgColor, textColor }: SegmentHeaderProps) {
  return (
    <div className={`mb-3 border-l-4 ${borderColor} ${bgColor} rounded-sm`}>
      <div className="px-4 py-2">
        <span className={`text-xs font-bold tracking-wider ${textColor}`}>
          {label} ({count} properties)
        </span>
      </div>
      <div className="px-4 pb-2">
        <p className={`text-[11px] leading-relaxed ${textColor} opacity-80`}>{subtitle}</p>
      </div>
    </div>
  );
}
