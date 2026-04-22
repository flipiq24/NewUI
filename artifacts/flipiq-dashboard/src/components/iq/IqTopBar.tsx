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
      <div className="flex items-center gap-4">
        {nextTask && (
          <button
            onClick={onNext}
            className={`text-xs flex items-center gap-1 ${onNext ? "cursor-pointer" : "cursor-default"}`}
          >
            <span className="font-semibold text-orange-500">Next Task:</span>
            <span className="text-gray-600">{nextTask}</span>
            {onNext && (
              <svg className="w-3.5 h-3.5 text-orange-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,3 11,8 6,13" />
              </svg>
            )}
          </button>
        )}
        <button className="flex items-center gap-1.5 group">
          <span className="text-xs font-semibold text-orange-500 group-hover:text-orange-600 transition-colors">Need Help?</span>
          <span className="w-7 h-7 bg-orange-500 group-hover:bg-orange-600 rounded flex items-center justify-center transition-colors flex-shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
