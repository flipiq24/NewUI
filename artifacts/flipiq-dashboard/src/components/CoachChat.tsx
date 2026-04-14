import { useState } from "react";

export default function CoachChat() {
  const [message, setMessage] = useState("");

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Coach message */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center">
            <CoachIcon />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 mb-2">Good evening, Josh! I'm your Performance Coach.</p>
            <p className="text-sm text-gray-600 mb-2">Here's your end-of-day summary. I can help you:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                Review your wins and gaps
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                Analyze your performance vs team average
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                Plan priorities for tomorrow
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your performance..."
            className="flex-1 text-sm text-gray-500 placeholder-gray-400 bg-transparent outline-none"
          />
          <button className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-orange-600" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2l5 5H9v7H7V7H3l5-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function CoachIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a7.5 7.5 0 100 15A7.5 7.5 0 0010 2zm0 13a5.5 5.5 0 110-11 5.5 5.5 0 010 11z"/>
      <circle cx="10" cy="10" r="2.5"/>
    </svg>
  );
}
