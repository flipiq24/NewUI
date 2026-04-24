export default function IqAskBar() {
  return (
    <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-100">
      <div className="w-full flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-2.5 bg-white shadow-sm">
        <button className="w-5 h-5 rounded-full border-2 border-orange-500 bg-white flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer hover:bg-orange-50">
          <svg className="w-2.5 h-2.5 text-gray-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="8" y1="2" x2="8" y2="14" strokeLinecap="round" />
            <line x1="2" y1="8" x2="14" y2="8" strokeLinecap="round" />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Ask anything…"
          className="flex-1 text-[13px] text-gray-700 placeholder-gray-300 bg-transparent outline-none"
        />
        <button className="w-6 h-6 rounded-full bg-gray-900 hover:bg-gray-700 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer">
          <svg className="w-3 h-3 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6,3 11,8 6,13" /></svg>
        </button>
      </div>
    </div>
  );
}
