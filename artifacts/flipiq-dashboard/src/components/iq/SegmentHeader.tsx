interface SegmentHeaderProps {
  label: string;
  count: number;
  subtitle: string;
  color: string;
}

export default function SegmentHeader({ label, count, subtitle, color }: SegmentHeaderProps) {
  return (
    <div className="mb-2">
      <div className={`flex items-center gap-3 px-4 py-2 rounded-t-lg ${color}`}>
        <span className="text-xs font-bold text-white tracking-wider">{label}</span>
        <span className="text-xs text-white/80 font-medium">({count})</span>
      </div>
      <div className="bg-gray-50 border-x border-b border-gray-200 rounded-b-lg px-4 py-2 mb-3">
        <p className="text-[11px] text-gray-500 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}
