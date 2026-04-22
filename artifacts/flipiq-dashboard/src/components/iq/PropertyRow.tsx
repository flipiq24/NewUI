import { useLocation } from "wouter";
import type { DealProperty } from "@/lib/iq/mockData";

function OfferPill({ pct, label }: { pct: number; label: string }) {
  const color =
    pct >= 50
      ? "bg-orange-500 text-white"
      : pct >= 20
      ? "bg-gray-200 text-gray-700"
      : "border border-gray-300 bg-white text-gray-500";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {pct}% {label}
    </span>
  );
}

export default function PropertyRow({ property }: { property: DealProperty }) {
  const [, navigate] = useLocation();

  function handleClick() {
    navigate(`/iq/deal-review/${encodeURIComponent(property.address)}`);
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all"
    >
      <div className="flex gap-3">
        {/* Col 1 — Identity */}
        <div className="flex-[2] min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
              {property.priorityBadge}
            </span>
            <span className="text-gray-300 text-[10px]">•</span>
            <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
              {property.statusBadge}
            </span>
          </div>
          <div className="flex items-start gap-1 mb-0.5">
            <div className="flex flex-col gap-0.5 mt-0.5 flex-shrink-0">
              <EmailIcon />
              <PhoneCallIcon />
              <PersonIcon />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-900 flex items-center gap-1 flex-wrap">
                <GlobeIcon />
                <span className="truncate">{property.address}</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">{property.type}</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {property.propertyType} / {property.beds}Br / {property.baths}Ba / {property.garage}Gar / {property.year} / {property.sqft} / {property.lotSqft}
                {property.pool !== "None" ? ` / Pool: ${property.pool}` : ""}
              </p>
              <p className="text-[11px] text-gray-400">
                {property.days} Days • DOM: {property.dom} / CDOM: {property.cdom}
              </p>
              <p className="text-[11px] text-gray-400">
                Source: {property.source} -{" "}
                <span className={property.sourceStatus === "Active" ? "text-green-600" : "text-gray-500"}>
                  {property.sourceStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Col 2 — Price / Propensity */}
        <div className="w-[140px] flex-shrink-0">
          <p className="text-[18px] font-bold text-gray-900 mb-0.5">{property.price}</p>
          {property.propensityScore !== null && (
            <p className="text-[11px] text-gray-500 mb-1.5">
              Propensity: {property.propensityScore} | {property.propensityLabel}
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {property.tags.map((tag, i) => (
              <span
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  tag.startsWith("+") ? "text-orange-500 cursor-pointer" :
                  tag.includes("Equity") || tag.includes("Owner") ? "bg-green-50 text-green-700" :
                  "bg-blue-50 text-blue-700"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Col 3 — Last Open / Called */}
        <div className="w-[130px] flex-shrink-0">
          <div className="mb-1.5">
            <p className="text-[10px] text-gray-500 font-medium">Last Open Date: <span className="text-gray-800">{property.lastOpenDate}</span></p>
            {property.lastOpenNote && (
              <p className="text-[10px] text-orange-500 font-medium">{property.lastOpenNote}</p>
            )}
          </div>
          <p className="text-[10px] text-gray-500 font-medium">
            Last Called Date: <span className="text-gray-800">{property.lastCalledDate}</span>
          </p>
        </div>

        {/* Col 4 — Offer / Source */}
        <div className="w-[160px] flex-shrink-0">
          <div className="mb-1.5">
            <OfferPill pct={property.offerPct} label={property.offerLabel} />
          </div>
          <p className="text-[11px] text-orange-700 font-semibold mb-0.5">Next Steps: {property.nextSteps}</p>
          <p className="text-[10px] text-gray-500">Offer Negotiator: {property.negotiator}</p>
          <p className={`text-[10px] font-medium ${property.assignedUser === "Not Assigned" ? "text-gray-400" : "text-gray-600"}`}>
            Assigned User: {property.assignedUser}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg className="w-2.5 h-2.5 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="2.5" width="10" height="7" rx="1" />
      <polyline points="1,3 6,7 11,3" />
    </svg>
  );
}
function PhoneCallIcon() {
  return (
    <svg className="w-2.5 h-2.5 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 1.5h2.5l1 2.5-1.5 1C4.5 6.5 5.5 7.5 6.5 8l1-1.5L10 7.5v2.5a1 1 0 01-1 1C4 11 1 8 1 2.5a1 1 0 011-1z" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg className="w-2.5 h-2.5 text-gray-400" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="6" cy="4" r="2" />
      <path d="M2 10c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg className="w-3 h-3 text-gray-400 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="6" cy="6" r="4.5" />
      <ellipse cx="6" cy="6" rx="2" ry="4.5" />
      <line x1="1.5" y1="6" x2="10.5" y2="6" />
    </svg>
  );
}
