import type { DealProperty } from "@/lib/iq/mockData";

function OfferPill({ pct, label }: { pct: number; label: string }) {
  const color =
    pct >= 50
      ? "bg-orange-500 text-white"
      : pct > 0
      ? "bg-gray-100 text-gray-700 border border-gray-300"
      : "bg-white text-gray-500 border border-gray-300";
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${color}`}>
      {pct}% {label}
    </span>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
      {children}
    </p>
  );
}

export default function PropertyRow({ property, last }: { property: DealProperty; last?: boolean }) {
  return (
    <div className={`bg-white px-5 py-4 hover:bg-orange-50 transition-colors ${!last ? "border-b border-gray-100" : ""}`}>
      {/* Header: action icons + identity + status */}
      <div className="flex items-start gap-4">
        {/* Action icons */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <EmailIcon />
          <PersonIcon />
          <PhoneCallIcon />
        </div>

        {/* Identity column */}
        <div className="flex-1 min-w-0">
          {/* Top badges row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <input type="checkbox" className="w-4 h-4 accent-orange-500 cursor-pointer" />
            <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <span className="text-orange-500">▲</span>
              {property.priorityBadge}
            </span>
            <OfferPill pct={property.offerPct} label={property.offerLabel} />
            <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {property.type}
            </span>
            <span className="text-[11px] text-gray-500 ml-auto">
              Source:{" "}
              <span
                className={
                  property.sourceStatus === "Active"
                    ? "text-green-600 font-semibold"
                    : "text-gray-700 font-semibold"
                }
              >
                {property.source} · {property.sourceStatus}
              </span>
            </span>
          </div>

          {/* Address */}
          <p className="text-[14px] font-bold text-gray-900 mb-1 flex items-center gap-1.5 flex-wrap">
            <span>{property.address}</span>
            <GlobeIcon />
          </p>

          {/* Price line */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[20px] font-bold text-gray-900">{property.price}</span>
            {property.propensityScore !== null && (
              <span className="text-[11px] text-gray-500">
                Propensity:{" "}
                <span className="font-semibold text-gray-700">{property.propensityScore}</span>{" "}
                · {property.propensityLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-3 ml-12" />

      {/* Data grid */}
      <div className="ml-12 grid grid-cols-4 gap-x-6 gap-y-3">
        {/* Tags */}
        <div>
          <FieldLabel>Tags</FieldLabel>
          <div className="flex flex-col gap-0.5">
            {property.tags.map((tag, i) => (
              <span
                key={i}
                className={`text-[11px] font-medium ${
                  tag.startsWith("+")
                    ? "text-orange-500 cursor-pointer"
                    : tag.includes("Equity") || tag.includes("Owner") || tag.includes("Pain")
                    ? "text-green-700"
                    : "text-blue-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <FieldLabel>Activity</FieldLabel>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Last Open</p>
              <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                {property.lastOpenDate}
              </p>
              {property.lastOpenNote && (
                <p className="text-[10px] text-orange-500 font-medium leading-tight">
                  {property.lastOpenNote}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Last Called</p>
              <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                {property.lastCalledDate}
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <FieldLabel>Next Steps</FieldLabel>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold bg-orange-500 text-white px-2.5 py-0.5 rounded-full self-start">
              To do: {property.nextSteps}
            </span>
          </div>
        </div>

        {/* Assignment */}
        <div>
          <FieldLabel>Assignment</FieldLabel>
          <div className="space-y-1">
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Offer Negotiator</p>
              <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                {property.negotiator}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 leading-tight">Assigned User</p>
              <p
                className={`text-[12px] font-semibold leading-tight ${
                  property.assignedUser === "Not Assigned" ? "text-gray-400" : "text-gray-800"
                }`}
              >
                {property.assignedUser}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-600 hover:text-orange-500 cursor-pointer transition-colors"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <polyline points="2,5.5 10,12 18,5.5" strokeLinecap="round" />
    </svg>
  );
}
function PhoneCallIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-600 hover:text-orange-500 cursor-pointer transition-colors"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3h4l2 5-2.5 1.5A11 11 0 0013.5 13.5L15 11l5 2v4a2 2 0 01-2 2C7 19 1 13 1 5a2 2 0 012-2z"
      />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-600 hover:text-orange-500 cursor-pointer transition-colors"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="10" cy="7" r="3.5" />
      <path strokeLinecap="round" d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <circle cx="8" cy="8" r="6" />
      <ellipse cx="8" cy="8" rx="2.5" ry="6" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}
