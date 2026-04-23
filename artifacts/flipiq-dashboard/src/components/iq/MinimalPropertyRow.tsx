import type { DealProperty, ResponseStatus } from "@/lib/iq/mockData";
import { useDailyChecklist, type ActionKey } from "@/lib/iq/dailyChecklist";

const RESPONSE_DOT: Record<ResponseStatus, { color: string; label: string }> = {
  positive: { color: "bg-green-500", label: "Positive response" },
  neutral: { color: "bg-yellow-400", label: "Neutral response" },
  negative: { color: "bg-red-500", label: "Negative response" },
};

function ResponseDots({ property }: { property: DealProperty }) {
  const { textResponse, emailResponse } = property;
  if (!textResponse && !emailResponse) {
    return (
      <span
        className="inline-block w-2 h-2 rounded-full bg-gray-300"
        title="No response yet"
      />
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      {textResponse && (
        <span
          className={`inline-block w-2 h-2 rounded-full ${RESPONSE_DOT[textResponse].color}`}
          title={`Text: ${RESPONSE_DOT[textResponse].label}`}
        />
      )}
      {emailResponse && (
        <span
          className={`inline-block w-2 h-2 rounded-full ${RESPONSE_DOT[emailResponse].color}`}
          title={`Email: ${RESPONSE_DOT[emailResponse].label}`}
        />
      )}
    </span>
  );
}

const ACTIONS: { key: ActionKey; label: string }[] = [
  { key: "call", label: "Call" },
  { key: "text", label: "Text" },
  { key: "email", label: "Email" },
  { key: "notes", label: "Notes" },
];

function ActionChips({ propertyId }: { propertyId: number }) {
  const { done, toggle } = useDailyChecklist(propertyId);
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {ACTIONS.map(({ key, label }) => {
        const isDone = done[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            title={`${isDone ? "Done" : "Mark done"}: ${label}`}
            className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
              isDone
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-transparent text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function MinimalPropertyRow({
  property,
  index,
}: {
  property: DealProperty;
  index: number;
}) {
  const action = property.nextSteps || property.statusBadge.replace(/^To do:\s*/i, "");

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-[13px] font-medium text-gray-400 leading-6 w-5 flex-shrink-0 text-right">
        {index}.
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 leading-6">
          <ResponseDots property={property} />
          <span className="text-[14px] font-medium text-gray-900 truncate">
            {action}
          </span>
        </div>
        <div className="text-[13px] text-gray-600 leading-6 truncate">
          {property.address}
        </div>
        <div className="text-[12px] text-gray-400 leading-5 mt-0.5">
          {property.price}
          <span className="mx-1.5">·</span>
          {property.offerPct}% {property.offerLabel}
          <span className="mx-1.5">·</span>
          Last called {property.lastCalledDate}
        </div>
      </div>
      <ActionChips propertyId={property.id} />
    </div>
  );
}
