interface FlipiqLabelProps {
  size?: "sm" | "md" | "lg";
  suffix?: string;
  className?: string;
}

const SIZES = {
  sm: { img: "w-5 h-5", text: "text-[12px]", gap: "gap-1.5" },
  md: { img: "w-6 h-6", text: "text-[13px]", gap: "gap-2" },
  lg: { img: "w-7 h-7", text: "text-base", gap: "gap-2" },
};

export default function FlipiqLabel({ size = "md", suffix, className = "" }: FlipiqLabelProps) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <img
        src={`${import.meta.env.BASE_URL}flipiq-icon.png`}
        alt="FlipiQ"
        className={`${s.img} object-contain flex-shrink-0`}
      />
      <span className={`${s.text} font-semibold leading-none`}>
        <span className="text-gray-700">Flip</span>
        <span className="text-orange-500">iQ</span>
        {suffix && <span className="text-gray-700"> {suffix}</span>}
      </span>
    </span>
  );
}
