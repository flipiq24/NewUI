interface IntelligenceData {
  tier: string;
  summary: string;
  property: string[];
  seller: {
    painLevel: string;
    painScore: number;
    distressIndicators: string[];
    whyItMatters: string;
  };
  agent: {
    name: string;
    crmData: string[];
  };
  dynamicScript: string;
  ifInterested: string;
  ifResistant: string;
}

export default function IqPropertyIntelligence({ data }: { data: IntelligenceData }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <LightbulbIcon />
        <span className="text-sm font-bold text-gray-900">iQ Property Intelligence</span>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="2,6 5,9 10,3" />
          </svg>
          Analysis complete
        </span>
        <span className="text-[11px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{data.tier}</span>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <SectionLabel label="iQ Property Intelligence Summary" />
        <p className="text-xs text-gray-700 font-medium">{data.summary}</p>
      </div>

      {/* Property */}
      <div className="mb-4">
        <SectionLabel label="PROPERTY" />
        <ul className="space-y-0.5">
          {data.property.map((item, i) => (
            <li key={i} className="text-xs text-gray-700 flex gap-1">
              <span className="text-orange-400 flex-shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Seller */}
      <div className="mb-4">
        <SectionLabel label="SELLER" />
        <p className="text-xs text-gray-700 mb-1">
          <span className="font-semibold">Pain Level:</span> {data.seller.painLevel}
        </p>
        <p className="text-xs text-gray-700 mb-1">
          <span className="font-semibold">Pain Score:</span> {data.seller.painScore}
        </p>
        <p className="text-xs font-semibold text-gray-700 mb-0.5">Distress Indicators:</p>
        {data.seller.distressIndicators.map((d, i) => (
          <p key={i} className="text-xs text-red-700 flex gap-1">
            <span className="flex-shrink-0">•</span> {d}
          </p>
        ))}
        <p className="text-xs text-gray-600 mt-1">
          <span className="font-semibold">Why It Matters:</span> {data.seller.whyItMatters}
        </p>
      </div>

      {/* Agent */}
      <div className="mb-4">
        <SectionLabel label={`AGENT - ${data.agent.name}`} />
        <p className="text-xs font-semibold text-gray-700 mb-1">CRM Data:</p>
        <ul className="space-y-0.5">
          {data.agent.crmData.map((item, i) => (
            <li key={i} className="text-xs text-gray-700 flex gap-1">
              <span className="text-orange-400 flex-shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Dynamic Script */}
      <div className="mb-4">
        <SectionLabel label="DYNAMIC SCRIPT" />
        <pre className="text-xs text-gray-800 font-mono leading-relaxed whitespace-pre-wrap bg-white/60 rounded-lg p-3 border border-orange-100">
          {data.dynamicScript}
        </pre>
      </div>

      {/* If Interested */}
      <div className="mb-4">
        <SectionLabel label="IF INTERESTED" />
        <pre className="text-xs text-gray-800 font-mono leading-relaxed whitespace-pre-wrap bg-white/60 rounded-lg p-3 border border-orange-100">
          {data.ifInterested}
        </pre>
      </div>

      {/* If Resistant */}
      <div>
        <SectionLabel label="IF RESISTANT" />
        <pre className="text-xs text-gray-800 font-mono leading-relaxed whitespace-pre-wrap bg-white/60 rounded-lg p-3 border border-orange-100">
          {data.ifResistant}
        </pre>
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">{label}</p>
  );
}

function LightbulbIcon() {
  return (
    <svg className="w-5 h-5 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a6 6 0 00-3.5 10.84V14a1 1 0 001 1h5a1 1 0 001-1v-1.16A6 6 0 0010 2zM8.5 16h3v1a1.5 1.5 0 01-3 0v-1z" />
    </svg>
  );
}
