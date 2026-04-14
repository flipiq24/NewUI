import { Info, CheckCircle2 } from "lucide-react";

function StatCard({
  icon,
  title,
  mainValue,
  mainLabel,
  details,
}: {
  icon: React.ReactNode;
  title: string;
  mainValue: number;
  mainLabel?: string;
  details: { label: string; value: string | number }[];
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <Info className="w-3 h-3 text-gray-300" />
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span className="text-xl font-semibold text-gray-800">{mainValue}</span>
        <span className="text-xs text-gray-400">{mainLabel}</span>
      </div>
      {details.map((d, i) => (
        <div key={i} className="flex items-center justify-between py-0.5">
          <span className="text-[11px] text-gray-500">{d.label}:</span>
          <span className="text-[11px] text-gray-600">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function PerformanceStatCard({
  icon,
  title,
  mainValue,
  mainLabel,
  details,
  noCheck,
}: {
  icon: React.ReactNode;
  title: string;
  mainValue: number | string;
  mainLabel?: string;
  details: { label: string; value: string | number }[];
  noCheck?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
        <Info className="w-3 h-3 text-gray-300" />
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {!noCheck && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        <span className="text-xl font-semibold text-gray-800">{mainValue}</span>
        <span className="text-xs text-gray-400">{mainLabel}</span>
      </div>
      {details.map((d, i) => (
        <div key={i} className="flex items-center justify-between py-0.5">
          <span className="text-[11px] text-gray-500">{d.label}:</span>
          <span className="text-[11px] text-gray-600">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-3">{title}</p>
      <div className="grid grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function TwoColSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

function ThreeColSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-3">{title}</p>
      <div className="grid grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

function FourColSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-3">{title}</p>
      <div className="grid grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

export default function PerformanceReport() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-800">Performance Report for Josh Santos</span>
        <Info className="w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* COMMUNICATION */}
      <Section title="Communication">
        <PerformanceStatCard
          icon={<TextIcon />}
          title="Texts"
          mainValue={0}
          mainLabel="texts"
          details={[
            { label: "Deal Pipeline", value: 0 },
            { label: "Agent Outreach", value: 0 },
          ]}
        />
        <PerformanceStatCard
          icon={<EmailIcon />}
          title="Emails"
          mainValue={0}
          mainLabel="emails"
          details={[
            { label: "Deal Pipeline", value: 0 },
            { label: "Agent Outreach", value: 0 },
          ]}
        />
        <PerformanceStatCard
          icon={<CallIcon />}
          title="Calls"
          mainValue={0}
          mainLabel="calls (0 connected)"
          details={[
            { label: "Deal Pipeline", value: 0 },
            { label: "Agent Outreach", value: 0 },
            { label: "Avg Call Duration", value: "0:00" },
            { label: "Total Call Time", value: "0:00" },
          ]}
        />
      </Section>

      {/* RELATIONSHIPS */}
      <TwoColSection title="Relationships">
        <PerformanceStatCard
          icon={<RelIcon />}
          title="New Relationships"
          mainValue={0}
          mainLabel="new"
          details={[]}
        />
        <PerformanceStatCard
          icon={<UpgradeIcon />}
          title="Upgraded"
          mainValue={0}
          mainLabel="upgraded"
          details={[
            { label: "Priority", value: 0 },
            { label: "Hot", value: 0 },
            { label: "Warm", value: 0 },
          ]}
          noCheck
        />
      </TwoColSection>

      {/* ON OPEN / REVISIT */}
      <ThreeColSection title="On Open / Revisit">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <FolderIcon />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Opened New Deals</span>
            <Info className="w-3 h-3 text-gray-300" />
          </div>
          <div className="mb-2">
            <span className="text-xl font-semibold text-gray-800">3</span>
            <span className="text-xs text-gray-400 ml-1">deals</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <FlameSmIcon />
            <span className="text-[11px] text-gray-500">Hot Deals</span>
            <span className="ml-auto text-[11px] text-gray-600">3</span>
          </div>
          <div className="flex items-center gap-1 pl-4 mt-0.5">
            <span className="text-[10px] text-gray-400">Not Assigned</span>
            <span className="ml-auto text-[11px] text-gray-600">3</span>
          </div>
        </div>
        <PerformanceStatCard
          icon={<ReopenIcon />}
          title="Reopened Deals"
          mainValue={0}
          mainLabel="deals"
          details={[]}
        />
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <RatioIcon />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Reopen / New Ratio</span>
            <Info className="w-3 h-3 text-gray-300" />
          </div>
          <div>
            <span className="text-xl font-semibold text-gray-800">0.00</span>
          </div>
        </div>
      </ThreeColSection>

      {/* DEAL PROGRESS */}
      <FourColSection title="Deal Progress">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <OffersIcon />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Offers Sent</span>
            <Info className="w-3 h-3 text-gray-300" />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xl font-semibold text-gray-800">0</span>
            <span className="text-xs text-gray-400">sent</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Terms:</span>
            <span className="text-[11px] text-gray-600">0</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Contract:</span>
            <span className="text-[11px] text-gray-600">0</span>
          </div>
        </div>
        <PerformanceStatCard
          icon={<NegotIcon />}
          title="Negotiations"
          mainValue={0}
          mainLabel="deals"
          details={[]}
        />
        <PerformanceStatCard
          icon={<AcceptIcon />}
          title="Accepted"
          mainValue={0}
          mainLabel="accepted"
          details={[]}
        />
        <PerformanceStatCard
          icon={<AcqIcon />}
          title="Acquired"
          mainValue={0}
          mainLabel="closed"
          details={[]}
        />
      </FourColSection>

      {/* OTHER */}
      <TwoColSection title="Other">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <DealSourceIcon />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Deal Source</span>
            <Info className="w-3 h-3 text-gray-300" />
          </div>
          <div className="mb-2">
            <span className="text-xl font-semibold text-gray-800">0</span>
            <span className="text-xs text-gray-400 ml-1">total</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">MLS:</span>
            <span className="text-[11px] text-gray-600">0</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Direct Mail:</span>
            <span className="text-[11px] text-gray-600">0</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Cold Call:</span>
            <span className="text-[11px] text-gray-600">0</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Referral:</span>
            <span className="text-[11px] text-gray-600">0</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TimeIcon />
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Time</span>
            <Info className="w-3 h-3 text-gray-300" />
          </div>
          <div className="mb-2">
            <span className="text-xl font-semibold text-gray-800">1</span>
            <span className="text-xs text-gray-400 ml-1">minutes</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">PiQ:</span>
            <span className="text-[11px] text-gray-600">0 min</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Comps:</span>
            <span className="text-[11px] text-gray-600">1 min</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Inv Anly:</span>
            <span className="text-[11px] text-gray-600">0 min</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Offer:</span>
            <span className="text-[11px] text-gray-600">0 min</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-gray-500">Agents:</span>
            <span className="text-[11px] text-gray-600">0 min</span>
          </div>
        </div>
      </TwoColSection>
    </div>
  );
}

function TextIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-3 3V3a1 1 0 011-1z"/>
    </svg>
  );
}
function EmailIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="12" height="9" rx="1"/>
      <polyline points="2,4 8,9 14,4"/>
    </svg>
  );
}
function CallIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z"/>
    </svg>
  );
}
function RelIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="11" cy="10" r="2"/>
      <line x1="8.5" y1="7.5" x2="9.5" y2="8.5"/>
    </svg>
  );
}
function UpgradeIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="4,10 8,5 12,10"/>
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/>
    </svg>
  );
}
function FlameSmIcon() {
  return (
    <svg className="w-3 h-3 text-orange-500" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5C8 1.5 5 5 5 8.5a3 3 0 006 0C11 6.5 9.5 4 8 1.5z"/>
    </svg>
  );
}
function ReopenIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8a5 5 0 1010 0 5 5 0 00-10 0"/>
      <polyline points="3,5 3,8 6,8"/>
    </svg>
  );
}
function RatioIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="5" cy="5" r="2"/>
      <circle cx="11" cy="11" r="2"/>
      <line x1="3" y1="13" x2="13" y2="3"/>
    </svg>
  );
}
function OffersIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="4,10 7,13 12,5"/>
    </svg>
  );
}
function NegotIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h10a1 1 0 011 1v7a1 1 0 01-1 1H6l-3 3V3a1 1 0 011-1z"/>
      <line x1="6" y1="6" x2="10" y2="6"/>
    </svg>
  );
}
function AcceptIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1"/>
      <polyline points="5,8 7.5,10.5 11,6"/>
    </svg>
  );
}
function AcqIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2L2 7v7h5v-4h2v4h5V7L8 2z"/>
    </svg>
  );
}
function DealSourceIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 2a4 4 0 010 12M8 2a4 4 0 000 12M2 8h12"/>
    </svg>
  );
}
function TimeIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/>
      <polyline points="8,5 8,8 10.5,10.5"/>
    </svg>
  );
}
