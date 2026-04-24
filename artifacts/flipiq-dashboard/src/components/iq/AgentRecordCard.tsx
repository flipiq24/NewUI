import { useState } from "react";
import { PRIORITY_AGENT_JOSE, type ResponseStatus } from "@/lib/iq/mockData";

const RESPONSE_DOT: Record<ResponseStatus, string> = {
  positive: "bg-[#639922]",
  neutral: "bg-[#B4B2A9]",
  negative: "bg-[#E24B4A]",
};
const RESPONSE_LABEL: Record<ResponseStatus, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

function ChannelChip({
  status,
  label,
  children,
}: {
  status: ResponseStatus;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={`${label}: ${RESPONSE_LABEL[status]}`}
      className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 cursor-help"
    >
      {children}
      <span className={`w-1.5 h-1.5 rounded-full ${RESPONSE_DOT[status]}`} />
    </span>
  );
}

const CHANNEL_ICON = {
  phone: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 2.5h2.5l1.2 3-1.5 1A8 8 0 0010.5 11l1-1.5 3 1.2v2.5a1 1 0 01-1 1C7 14.2 1.8 9 1.8 3.5a1 1 0 011-1z" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <rect x="2" y="3.5" width="12" height="9" rx="1" />
      <polyline points="2.5,4.5 8,9 13.5,4.5" strokeLinecap="round" />
    </svg>
  ),
};

export default function AgentRecordCard() {
  const agent = PRIORITY_AGENT_JOSE;
  const [callChecked, setCallChecked] = useState(false);
  const [iqReportsChecked, setIqReportsChecked] = useState(true);
  const [relationshipChecked, setRelationshipChecked] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(true);
  const [relStatus, setRelStatus] = useState(agent.relationshipStatus);
  const [fuStatus, setFuStatus] = useState(agent.followUpStatus);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-sm font-bold text-orange-500">{agent.name}</span>
        <svg className="w-3.5 h-3.5 text-gray-400 cursor-pointer" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 4L8 2 5 4M5 12l3 2 3-2M2 7l2 1.5L2 10M14 7l-2 1.5 2 1.5" />
        </svg>
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[10px] text-gray-500">Assigned:</span>
          <select className="text-xs border border-gray-200 rounded px-2 py-0.5 bg-white">
            <option>{agent.assignedTo}</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {agent.criticals} Critical
          </span>
          <span className="inline-flex items-center gap-2.5 pl-2 border-l border-gray-200">
            <ChannelChip status={agent.callResponse} label="Call">{CHANNEL_ICON.phone}</ChannelChip>
            <ChannelChip status={agent.textResponse} label="Text">{CHANNEL_ICON.text}</ChannelChip>
            <ChannelChip status={agent.emailResponse} label="Email">{CHANNEL_ICON.mail}</ChannelChip>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 pl-2 border-l border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {agent.reminders} Reminders
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[10px] text-gray-500">Do Not Call</span>
            <div className="w-8 h-4 bg-gray-200 rounded-full relative cursor-pointer">
              <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Three-column info */}
      <div className="grid grid-cols-3 gap-0 divide-x divide-gray-100 px-0">
        <div className="p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Agent Record</p>
          <p className="text-[11px] text-gray-700 mb-0.5">📞 {agent.phone}</p>
          <p className="text-[11px] text-gray-700 mb-0.5">✉️ {agent.email}</p>
          <p className="text-[11px] text-gray-700 mb-0.5">🏢 {agent.company}</p>
          <p className="text-[11px] text-gray-700 mb-2">📍 {agent.address}</p>
          <div className="flex gap-2">
            {["in", "fb", "ig", "web"].map((s) => (
              <span key={s} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-pointer hover:bg-gray-200">{s}</span>
            ))}
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Last Communication</p>
          <InfoRow label="Last Communication Date" value={agent.lastCommunicationDate} />
          <InfoRow label="Last Communication Type" value={agent.lastCommunicationType} />
          <InfoRow label="Last Address Discussed" value={agent.lastAddressDiscussed} />
          <InfoRow label="Last Communicated AA" value={agent.lastCommunicatedAA} />
        </div>
        <div className="p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Performance</p>
          <InfoRow label="Licensed Since" value={String(agent.licensedSince)} />
          <InfoRow label="License #" value={agent.licenseNumber} />
          <InfoRow label="Active In Last 2 Years" value={agent.activeInLast2Years ? "TRUE" : "FALSE"} valueClass={agent.activeInLast2Years ? "text-green-600 font-semibold" : "text-red-500"} />
          <InfoRow label="Average Deals Per Year" value={String(agent.avgDealsPerYear)} />
          <InfoRow label="Double Ended" value={String(agent.doubleEnded)} />
          <InfoRow label="Investor Source" value={String(agent.investorSource)} />
        </div>
      </div>

      {/* NEXT STEPS */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Next Steps</p>
        <div className="flex flex-wrap gap-3">
          <CheckStep label="Call Agent" checked={callChecked} onChange={setCallChecked} />
          <CheckStep label="Agent Rating - Unknown" checked={false} onChange={() => {}} />
          <CheckStep label="Set reminder" checked={false} onChange={() => {}} />
          <CheckStep label="Run agent iQ reports" checked={iqReportsChecked} onChange={setIqReportsChecked} orange />
          <CheckStep label="Relationship Status - Priority" checked={relationshipChecked} onChange={setRelationshipChecked} orange />
          <button className="text-[11px] text-orange-500 hover:underline font-medium">+ Add</button>
        </div>
      </div>

      {/* Two-panel grid */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
        <div className="p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Agent Status</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 w-32 flex-shrink-0">Relationship Status:</span>
              <select value={relStatus} onChange={(e) => setRelStatus(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white flex-1">
                <option>Priority</option>
                <option>Hot</option>
                <option>Warm</option>
                <option>Cold</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 w-32 flex-shrink-0">Basket:</span>
              <select className="text-xs border border-gray-200 rounded px-2 py-1 bg-white flex-1">
                <option>Select…</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 w-32 flex-shrink-0">Agent Investor:</span>
              <span className="text-xs font-medium text-gray-800">{agent.agentInvestor}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Follow Up</p>
            <button className="text-[10px] text-orange-500 hover:underline font-medium">Set Reminder</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 w-36 flex-shrink-0">Follow Up Status:</span>
              <select value={fuStatus} onChange={(e) => setFuStatus(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white flex-1">
                <option>Relationship Built</option>
                <option>In Progress</option>
                <option>Pending</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 w-36 flex-shrink-0">Follow Up Status Date:</span>
              <span className="text-xs text-gray-800">{agent.followUpStatusDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Info Details (collapsible) */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setInfoOpen(!infoOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700">Agent Info Details</span>
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${infoOpen ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4,6 8,10 12,6" />
          </svg>
        </button>
        {infoOpen && (
          <div className="px-4 pb-3 text-xs text-gray-500">Additional agent info not yet configured.</div>
        )}
      </div>

      {/* Agent Notes (collapsible, open) */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <span className="text-xs font-semibold text-gray-700">Agent Notes</span>
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${notesOpen ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4,6 8,10 12,6" />
          </svg>
        </button>
        {notesOpen && (
          <div className="px-4 pb-4">
            {/* Note input */}
            <div className="flex items-start gap-2 mb-3">
              <input
                type="text"
                placeholder="Start typing..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-400"
              />
              <button className="text-gray-400 hover:text-gray-600 p-2">📎</button>
              <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                <input type="checkbox" className="accent-orange-500" /> Communication
              </label>
              <label className="flex items-center gap-1 text-[10px] text-gray-500 cursor-pointer">
                <input type="checkbox" className="accent-orange-500" /> Critical
              </label>
              <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                Post Note
              </button>
            </div>

            {/* Notes list */}
            <div className="space-y-2">
              {agent.notes.map((note, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-gray-800">{note.author}</span>
                    <span className="text-[10px] text-gray-400">{note.age} ago</span>
                    <div className="ml-auto flex gap-1">
                      {note.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center gap-1 mb-0.5">
      <span className="text-[10px] text-gray-500 flex-shrink-0">{label}:</span>
      <span className={`text-[10px] font-medium ${valueClass ?? "text-gray-800"}`}>{value}</span>
    </div>
  );
}

function CheckStep({ label, checked, onChange, orange }: { label: string; checked: boolean; onChange: (v: boolean) => void; orange?: boolean }) {
  return (
    <label className={`flex items-center gap-1.5 cursor-pointer text-[11px] font-medium ${orange && checked ? "text-orange-600" : "text-gray-700"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-orange-500"
      />
      {label}
    </label>
  );
}
