interface IqTopBarProps {
  breadcrumb?: string;
  nextTask?: string | null;
  onNext?: () => void;
  title?: string;
}

export default function IqTopBar({ breadcrumb, nextTask, onNext, title }: IqTopBarProps) {
  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
      <div className="flex-1 flex items-center gap-2">
        {title && (
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        )}
        {breadcrumb && (
          <span className="text-xs text-gray-500">{breadcrumb}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {nextTask && (
          <button
            onClick={onNext}
            className={`text-xs text-gray-500 flex items-center gap-1 ${onNext ? "cursor-pointer hover:text-orange-500 transition-colors" : "cursor-default"}`}
          >
            <span className="font-medium">Next Task:</span>
            <span className="text-gray-700 font-semibold">{nextTask}</span>
            {onNext && (
              <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,3 11,8 6,13" />
              </svg>
            )}
          </button>
        )}
        <button className="text-xs font-medium text-orange-500 border border-orange-300 rounded-md px-3 py-1.5 hover:bg-orange-50 transition-colors">
          Need Help?
        </button>
      </div>
    </div>
  );
}
