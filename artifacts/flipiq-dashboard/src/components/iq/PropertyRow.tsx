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

export default function PropertyRow({ property, last }: { property: DealProperty; last?: boolean }) {
  return (
    <div className={`bg-white px-3 py-3 hover:bg-orange-50 transition-colors ${!last ? "border-b border-gray-100" : ""}`}>
      <div className="grid grid-cols-[24px_32px_auto_140px_150px_200px] gap-0 items-start">

        {/* Checkbox */}
        <div className="flex items-center pt-1">
          <input type="checkbox" className="w-3.5 h-3.5 accent-orange-500 cursor-pointer" />
        </div>

        {/* Action icons — email, person, phone — bigger */}
        <div className="flex flex-col items-center gap-2 pt-0.5">
          <EmailIcon />
          <PersonIcon />
          <PhoneCallIcon />
        </div>

        {/* Property identity */}
        <div className="pr-3 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {property.priorityBadge}
            </span>
            <span className="text-gray-300 text-xs">•</span>
            <span className="text-[11px] font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {property.statusBadge}
            </span>
          </div>
          <p className="text-[13px] font-bold text-gray-900 mb-0.5 flex items-center gap-1 flex-wrap">
            <GlobeIcon />
            <span>{property.address}</span>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{property.type}</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            {property.propertyType} / {property.beds}Br / {property.baths}Ba / {property.garage}Gar / {property.year} / {property.sqft} / {property.lotSqft}
            {property.pool !== "None" ? ` / Pool: ${property.pool}` : ""}
          </p>
          <p className="text-[11px] text-gray-400">
            {property.days} Days • DOM: {property.dom} / CDOM: {property.cdom}
          </p>
        </div>

        {/* Price / Propensity / Tags */}
        <div className="pr-2">
          <p className="text-[17px] font-bold text-gray-900 mb-0.5">{property.price}</p>
          {property.propensityScore !== null && (
            <p className="text-[11px] text-gray-500 mb-1.5">
              Propensity: <span className="font-semibold text-gray-700">{property.propensityScore}</span> | {property.propensityLabel}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {property.tags.map((tag, i) => (
              <span
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  tag.startsWith("+") ? "text-orange-500 cursor-pointer" :
                  tag.includes("Equity") || tag.includes("Owner") || tag.includes("Pain") ? "bg-green-50 text-green-700" :
                  "bg-blue-50 text-blue-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Last Open / Called */}
        <div>
          <div className="mb-1.5">
            <p className="text-[10px] text-gray-500">Last Open Date:</p>
            <p className="text-[11px] font-semibold text-gray-800">{property.lastOpenDate}</p>
            {property.lastOpenNote && (
              <p className="text-[10px] text-orange-500 font-medium">{property.lastOpenNote}</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Last Called Date:</p>
            <p className="text-[11px] font-semibold text-gray-800">{property.lastCalledDate}</p>
          </div>
        </div>

        {/* Offer Status / Source */}
        <div>
          <p className="text-[10px] text-gray-500 mb-1">
            Source: <span className={property.sourceStatus === "Active" ? "text-green-600 font-semibold" : "text-gray-600 font-semibold"}>{property.source} - {property.sourceStatus}</span>
          </p>
          <div className="mb-1.5">
            <OfferPill pct={property.offerPct} label={property.offerLabel} />
          </div>
          <p className="text-[11px] text-orange-600 font-semibold mb-0.5">
            Next Steps: {property.nextSteps}
          </p>
          <p className="text-[10px] text-gray-500">Offer Negotiator: {property.negotiator}</p>
          <p className={`text-[10px] ${property.assignedUser === "Not Assigned" ? "text-gray-400" : "text-gray-600"}`}>
            Assigned User: {property.assignedUser}
          </p>
        </div>

      </div>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="16" height="12" rx="2" />
      <polyline points="2,5.5 10,12 18,5.5" strokeLinecap="round" />
    </svg>
  );
}
function PhoneCallIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h4l2 5-2.5 1.5A11 11 0 0013.5 13.5L15 11l5 2v4a2 2 0 01-2 2C7 19 1 13 1 5a2 2 0 012-2z" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 hover:text-orange-500 cursor-pointer transition-colors" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="7" r="3.5" />
      <path strokeLinecap="round" d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="8" cy="8" r="6" />
      <ellipse cx="8" cy="8" rx="2.5" ry="6" />
      <line x1="2" y1="8" x2="14" y2="8" />
    </svg>
  );
}
