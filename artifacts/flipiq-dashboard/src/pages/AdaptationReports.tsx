import { useState } from "react";
import { Link } from "wouter";
import Sidebar from "@/components/Sidebar";
import StatsHeader from "@/components/StatsHeader";
import { ChevronLeft } from "lucide-react";

const CHECK_SVG = (
  <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type AAKey = "jenna" | "devon" | "marcus" | "priya";

type DealSourceRow = { label: string; pct: string; w: string };

type AAData = {
  name: string;
  tag: string;
  tagClass: string;
  day: string;
  status: string;
  statusClass: string;
  eng: string; engW: string; engC: string; engSub: string;
  hours: string; hoursW: string; hoursC: string; hoursSub: string;
  adapt: string; adaptW: string; adaptC: string; adaptSub: string;
  pip: string; pipW: string; pipC: string; pipSub: string;
  camp: string; campW: string; campC: string; campSub: string;
  rel: string; relW: string; relC: string; relSub: string;
  off: string; offW: string; offC: string; offSub: string;
  training: string;
  phase: string;
  dealSource: DealSourceRow[];
};

const aaData: Record<AAKey, AAData> = {
  jenna: {
    name: "Jenna Castillo", tag: "Power User", tagClass: "green", day: "Day 34 · Coko Homes",
    status: "On Track", statusClass: "on-track",
    eng: "75%", engW: "75%", engC: "warn", engSub: "20 days · 15 check-ins · ↓ below 80% target",
    hours: "5.6h", hoursW: "90%", hoursC: "good", hoursSub: "Team avg: 3.5h · ↑ 123% above avg",
    adapt: "85%", adaptW: "85%", adaptC: "good", adaptSub: "Team avg: 72% · ↑ leading team",
    pip: "72%", pipW: "72%", pipC: "warn", pipSub: "100 active · 38 overdue · ↓ team: 65/102/59",
    camp: "75%", campW: "75%", campC: "warn", campSub: "20 days · 15 active · ↓ 5 days missed",
    rel: "3.5", relW: "68%", relC: "warn", relSub: "Team avg: 5.1 · ↓ below target",
    off: "3.4", offW: "68%", offC: "warn", offSub: "Team avg: 5.0 · ↓ below target",
    training: "9/11", phase: "Phase 1 — 9/11 Complete",
    dealSource: [
      { label: "Hot Properties", pct: "50%", w: "50%" },
      { label: "MLS Search", pct: "20%", w: "20%" },
      { label: "Deal Outreach", pct: "15%", w: "15%" },
      { label: "Off Market", pct: "15%", w: "15%" },
    ],
  },
  devon: {
    name: "Devon Okafor", tag: "Capable", tagClass: "blue", day: "Day 21 · Coko Homes",
    status: "Needs Coaching", statusClass: "coaching",
    eng: "60%", engW: "60%", engC: "warn", engSub: "20 days · 12 check-ins · ↓ below 80% target",
    hours: "3.8h", hoursW: "55%", hoursC: "warn", hoursSub: "Team avg: 3.5h · → near avg",
    adapt: "74%", adaptW: "74%", adaptC: "warn", adaptSub: "Team avg: 72% · → on par",
    pip: "55%", pipW: "55%", pipC: "bad", pipSub: "88 active · 44 overdue · ↓ below team",
    camp: "60%", campW: "60%", campC: "warn", campSub: "20 days · 12 active · ↓ needs improvement",
    rel: "2.8", relW: "55%", relC: "bad", relSub: "Team avg: 5.1 · ↓ significantly below",
    off: "2.1", offW: "42%", offC: "bad", offSub: "Team avg: 5.0 · ↓ needs urgent attention",
    training: "6/11", phase: "Phase 1 — 6/11 Complete",
    dealSource: [
      { label: "Hot Properties", pct: "35%", w: "35%" },
      { label: "MLS Search", pct: "30%", w: "30%" },
      { label: "Deal Outreach", pct: "25%", w: "25%" },
      { label: "Off Market", pct: "10%", w: "10%" },
    ],
  },
  marcus: {
    name: "Marcus Webb", tag: "Traditional", tagClass: "yellow", day: "Day 18 · Coko Homes",
    status: "At Risk", statusClass: "at-risk",
    eng: "20%", engW: "20%", engC: "bad", engSub: "20 days · 4 check-ins · ↓↓ 3-day zero-activity flag",
    hours: "1.1h", hoursW: "18%", hoursC: "bad", hoursSub: "Team avg: 3.5h · ↓↓ critical",
    adapt: "52%", adaptW: "52%", adaptC: "bad", adaptSub: "Team avg: 72% · ↓ below baseline",
    pip: "30%", pipW: "30%", pipC: "bad", pipSub: "41 active · 22 overdue · ↓↓ critical",
    camp: "20%", campW: "20%", campC: "bad", campSub: "20 days · 4 active · ↓↓ not running",
    rel: "0.8", relW: "16%", relC: "bad", relSub: "Team avg: 5.1 · ↓↓ not building",
    off: "0.3", offW: "6%", offC: "bad", offSub: "Team avg: 5.0 · ↓↓ near zero",
    training: "4/11", phase: "Phase 1 — 4/11 Complete",
    dealSource: [
      { label: "Hot Properties", pct: "70%", w: "70%" },
      { label: "MLS Search", pct: "15%", w: "15%" },
      { label: "Deal Outreach", pct: "10%", w: "10%" },
      { label: "Off Market", pct: "5%", w: "5%" },
    ],
  },
  priya: {
    name: "Priya Nair", tag: "Novice", tagClass: "gray", day: "Day 9 · Coko Homes",
    status: "Needs Coaching", statusClass: "coaching",
    eng: "44%", engW: "44%", engC: "warn", engSub: "9 days · 4 check-ins · ↓ new user, needs habit",
    hours: "2.5h", hoursW: "40%", hoursC: "warn", hoursSub: "Team avg: 3.5h · ↓ below avg",
    adapt: "38%", adaptW: "38%", adaptC: "warn", adaptSub: "Team avg: 72% · early stage — expected",
    pip: "18%", pipW: "18%", pipC: "bad", pipSub: "22 active · 8 overdue · building pipeline",
    camp: "22%", campW: "22%", campC: "warn", campSub: "9 days · 2 active · just starting",
    rel: "1.2", relW: "24%", relC: "warn", relSub: "Team avg: 5.1 · early stage",
    off: "0.9", offW: "18%", offC: "warn", offSub: "Team avg: 5.0 · learning the flow",
    training: "3/11", phase: "Phase 1 — 3/11 Complete",
    dealSource: [
      { label: "Hot Properties", pct: "60%", w: "60%" },
      { label: "MLS Search", pct: "25%", w: "25%" },
      { label: "Deal Outreach", pct: "10%", w: "10%" },
      { label: "Off Market", pct: "5%", w: "5%" },
    ],
  },
};

const trainingItems = [
  { text: "Introduction to FlipIQ COMMAND", date: "Apr 9" },
  { text: "Basic Navigation & Sidebar", date: "Apr 9" },
  { text: "iQ Dashboard — Daily Check-In", date: "Apr 10" },
  { text: "Adding an Agent", date: "Apr 10" },
  { text: "Sending an Offer", date: "Apr 11" },
  { text: "Following Up on Deals (Deal Review)", date: "Apr 11" },
  { text: "PiQ — Property Analysis", date: "Apr 12" },
  { text: "My Active Deals — Pipeline Process", date: "Apr 12" },
  { text: "Campaigns — Setup & Templates", date: "Apr 13" },
  { text: "Auto Tracker — Setup & Monitoring", date: "Next — Apr 15", isNext: true },
  { text: "MLS Search — Hot Deals & Aged Inventory", date: "Not yet" },
];

const getCompletedCount = (aa: AAKey) => {
  const counts: Record<AAKey, number> = { jenna: 9, devon: 6, marcus: 4, priya: 3 };
  return counts[aa];
};

function tagColors(cls: string) {
  const map: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-800",
    blue: "bg-blue-50 text-blue-800",
    yellow: "bg-amber-50 text-amber-800",
    gray: "bg-gray-100 text-gray-500",
    red: "bg-red-50 text-red-800",
  };
  return map[cls] || "bg-gray-100 text-gray-500";
}

function statusColors(cls: string) {
  const map: Record<string, string> = {
    "on-track": "bg-emerald-50 text-emerald-800",
    coaching: "bg-amber-50 text-amber-800",
    "at-risk": "bg-red-50 text-red-800",
  };
  return map[cls] || "bg-gray-100 text-gray-500";
}

function barColor(c: string) {
  if (c === "good") return "bg-emerald-500";
  if (c === "warn") return "bg-amber-400";
  return "bg-red-500";
}

function subText(raw: string) {
  return raw.split(/(↑|↓↓|↓)/).map((part, i) => {
    if (part === "↑") return <span key={i} className="text-emerald-600 font-semibold">↑</span>;
    if (part === "↓↓") return <span key={i} className="text-red-600 font-semibold">↓↓</span>;
    if (part === "↓") return <span key={i} className="text-red-500 font-semibold">↓</span>;
    return <span key={i}>{part}</span>;
  });
}

type Note = {
  date: string;
  attendees: string;
  pill: string;
  pillClass: string;
  body: string;
  snapshot: { label: string; val: string; sub: string }[];
  chips: { text: string; cls: string }[];
};

const initialNotes: Note[] = [
  {
    date: "Apr 14, 2026",
    attendees: "Weekly Check-In · Ramy + Jenna · 15 min",
    pill: "Coaching Focus",
    pillClass: "bg-amber-50 text-amber-800",
    body: "Pipeline is healthy at 107 properties. Two focus areas: (1) offer rate is at 3.4/day vs target of 5 — Jenna will block 30 minutes daily specifically for offer sends. (2) 38 overdue properties identified — pipeline cleanup scheduled before Apr 16. Auto Tracker training moved to Apr 15 to help manage the overdue backlog. Engagement dipped to 75% — reinforced importance of daily check-in.",
    snapshot: [
      { label: "Engagement", val: "75%", sub: "15/20 days" },
      { label: "Adaptation", val: "85%", sub: "↑ team avg 72%" },
      { label: "Pipeline", val: "100", sub: "38 overdue" },
      { label: "Offers/Day", val: "3.4", sub: "target: 5.0" },
      { label: "Campaigns", val: "75%", sub: "15/20 days" },
      { label: "Relationships", val: "3.5", sub: "team: 5.1/day" },
      { label: "Hours/Day", val: "5.6h", sub: "↑ 123% vs team" },
      { label: "Deal Source", val: "50%", sub: "Hot Properties" },
    ],
    chips: [
      { text: "Action: Pipeline cleanup by Apr 16", cls: "bg-orange-50 text-orange-700" },
      { text: "Action: Auto Tracker training Apr 15", cls: "bg-blue-50 text-blue-700" },
      { text: "Action: 30-min daily offer block", cls: "bg-orange-50 text-orange-700" },
    ],
  },
  {
    date: "Apr 7, 2026",
    attendees: "Onboarding Kickoff · Ramy + Jenna + Tony · 30 min",
    pill: "On Track",
    pillClass: "bg-emerald-50 text-emerald-800",
    body: "Contract signed. Proficiency assigned: Power User — Jenna is tech-savvy, no need to slow down on navigation basics. Training sequence confirmed: start immediately with deal review and PiQ. Goal established: 2 deals/month by end of 30 days. Jenna is motivated and understood the suspension policy clearly. Pipeline goal: build to 100 active properties in the first 10 days.",
    snapshot: [
      { label: "Engagement", val: "—", sub: "Day 1" },
      { label: "Adaptation", val: "—", sub: "Not started" },
      { label: "Pipeline", val: "0", sub: "Building" },
      { label: "Offers/Day", val: "—", sub: "Not started" },
      { label: "Campaigns", val: "—", sub: "Not started" },
      { label: "Relationships", val: "—", sub: "Not started" },
      { label: "Hours/Day", val: "—", sub: "Day 1" },
      { label: "Training", val: "0/11", sub: "Starting now" },
    ],
    chips: [
      { text: "✓ Contract signed", cls: "bg-emerald-50 text-emerald-700" },
      { text: "✓ Tag: Power User", cls: "bg-emerald-50 text-emerald-700" },
      { text: "Action: Build pipeline to 100 in 10 days", cls: "bg-blue-50 text-blue-700" },
    ],
  },
];

function SectionNum({ n }: { n: number }) {
  return (
    <div className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </div>
  );
}

function MetricCard({ label, value, sub, barW, barC }: { label: string; value: React.ReactNode; sub: string; barW: string; barC: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none">{label}</div>
        <div className="text-lg font-black text-gray-900 leading-none flex-shrink-0">{value}</div>
      </div>
      <div className="text-[10px] text-gray-400 leading-snug mb-1.5">{subText(sub)}</div>
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor(barC)}`} style={{ width: barW }} />
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-bold text-gray-900 font-mono">{note.date}</span>
        <span className="text-[11px] text-gray-400">{note.attendees}</span>
        <span className={`ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${note.pillClass}`}>{note.pill}</span>
      </div>
      <div className="px-4 py-3 text-[13px] text-gray-700 leading-relaxed border-b border-gray-100">
        {note.body}
      </div>
      <div className="mx-4 my-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Snapshot at time of meeting — {note.date}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {note.snapshot.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-md px-2 py-1.5">
              <div className="text-[10px] text-gray-400 mb-0.5">{s.label}</div>
              <div className="text-sm font-bold text-gray-900 font-mono">{s.val}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {note.chips.map((c, i) => (
          <span key={i} className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${c.cls}`}>{c.text}</span>
        ))}
      </div>
    </div>
  );
}

type ViewKey = "team" | AAKey;

const teamDealSource: DealSourceRow[] = [
  { label: "Hot Properties", pct: "54%", w: "54%" },
  { label: "MLS Search", pct: "23%", w: "23%" },
  { label: "Deal Outreach", pct: "15%", w: "15%" },
  { label: "Off Market", pct: "9%",  w: "9%"  },
];

const individualConditions = [
  "I am a full-time user — I will engage with the system consistently during working hours",
  "I will follow the established FlipIQ process because we know it works",
  "I know the system is not perfect — I am an early adopter and I accept this",
  "My feedback is focused on one goal: reaching a minimum of 2 closed deals per month",
  "I will complete my daily iQ check-in every working day",
  "I will maintain an active pipeline of approximately 100 properties",
  "I will attend all scheduled training sessions and act on agreed follow-up items",
  "I understand FlipIQ is an efficiency tool — not a magic wand",
  "I will submit system improvement suggestions through the proper feedback channel",
  "I accept that 3 consecutive zero-activity days may trigger a suspension review",
];

const amConditions = [
  "I will maintain a minimum of 2 full-time AAs actively using the system at all times",
  "My goal is 4 full-time AAs engaged and following the process within 60 days",
  "I will not place part-time users on the platform — they take agents from producers",
  "I will support the FlipIQ process — not a custom workflow that bypasses it",
  "I will attend the weekly 15-minute Adaptation Meeting with Ramy — data in hand",
  "I will review each AA's pipeline daily and verify offer status, notes, and follow-up",
  "I will respond to FlipIQ escalation notices within 24 hours",
  "I will act when an AA shows 3 consecutive zero-activity days",
  "I will reinforce the process with my team — not create workarounds",
  "I accept that non-compliant users may be suspended if I do not act on escalations",
];

export default function AdaptationReports() {
  const [selectedView, setSelectedView] = useState<ViewKey>("jenna");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const isTeam = selectedView === "team";
  const aa = isTeam ? null : aaData[selectedView as AAKey];
  const completedCount = isTeam ? 0 : getCompletedCount(selectedView as AAKey);

  function saveNote() {
    if (!noteText.trim() || !aa) return;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const newNote: Note = {
      date: today,
      attendees: `Meeting Note · Ramy + ${aa.name.split(" ")[0]}`,
      pill: "New",
      pillClass: "bg-emerald-50 text-emerald-800",
      body: noteText.trim(),
      snapshot: [
        { label: "Engagement", val: aa.eng, sub: "" },
        { label: "Adaptation", val: aa.adapt, sub: "" },
        { label: "Pipeline", val: aa.pip, sub: "" },
        { label: "Offers/Day", val: aa.off, sub: "" },
        { label: "Campaigns", val: aa.camp, sub: "" },
        { label: "Relationships", val: aa.rel, sub: "" },
        { label: "Hours/Day", val: aa.hours, sub: "" },
        { label: "Training", val: aa.training, sub: "" },
      ],
      chips: [{ text: `Saved ${today}`, cls: "bg-blue-50 text-blue-700" }],
    };
    setNotes([newNote, ...notes]);
    setNoteText("");
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsHeader />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">

            {/* Page header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
                    <ChevronLeft className="w-3 h-3" /> My Stats
                  </Link>
                </div>
                <h2 className="text-xl font-black text-gray-900">Adaptation Reports</h2>
              </div>
            </div>

            {/* View Selector bar */}
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value as ViewKey)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 bg-gray-50 outline-none cursor-pointer min-w-[200px] focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="team">Team View</option>
                <option value="jenna">Jenna Castillo</option>
                <option value="devon">Devon Okafor</option>
                <option value="marcus">Marcus Webb</option>
                <option value="priya">Priya Nair</option>
              </select>
              {isTeam ? (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800">4 AAs</span>
                  <span className="text-xs text-gray-400 font-mono">Coko Homes · Apr 2026</span>
                </div>
              ) : aa ? (
                <div className="flex items-center gap-2 ml-auto">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${tagColors(aa.tagClass)}`}>{aa.tag}</span>
                  <span className="text-xs text-gray-400 font-mono">{aa.day}</span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors(aa.statusClass)}`}>{aa.status}</span>
                </div>
              ) : null}
            </div>

            {/* Section 1 — Dashboard */}
            <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                <SectionNum n={1} />
                <span className="text-sm font-bold text-gray-900">Dashboard</span>
                <span className="text-xs text-gray-400 font-normal ml-1">
                  {isTeam ? "— what your team is doing, and what they're not" : "— what you're doing, and what you're not"}
                </span>
                <span className="ml-auto text-[11px] text-gray-400 font-mono">3/14/26 – 4/14/26 · 20 work days</span>
              </div>
              <div className="p-5">
                {isTeam ? (
                  <>
                    <div className="grid grid-cols-4 gap-2.5 mb-4">
                      <MetricCard label="Engagement" value={<>50<span className="text-sm text-gray-300 font-semibold">%</span></>} sub="Team avg · target 80%" barW="50%" barC="warn" />
                      <MetricCard label="Avg Hours / Day" value={<>3.3<span className="text-sm text-gray-300 font-semibold">h</span></>} sub="Team avg · target 4h" barW="47%" barC="warn" />
                      <MetricCard label="System Adaptation" value={<>62<span className="text-sm text-gray-300 font-semibold">%</span></>} sub="Team avg · target 80%" barW="62%" barC="warn" />
                      <MetricCard label="Pipeline Compliance" value={<>44<span className="text-sm text-gray-300 font-semibold">%</span></>} sub="Team avg · target 80%" barW="44%" barC="bad" />
                      <MetricCard label="Campaigns" value={<>44<span className="text-sm text-gray-300 font-semibold">%</span></>} sub="Team avg · target 80%" barW="44%" barC="bad" />
                      <MetricCard label="Relationships / Day" value="2.1" sub="Team avg · target 5.1" barW="41%" barC="bad" />
                      <MetricCard label="Avg Offers / Day" value="1.7" sub="Team avg · target 5.0" barW="34%" barC="bad" />
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Deal Source</div>
                        <div className="space-y-1.5">
                          {teamDealSource.map((row, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="w-28 text-gray-600 flex-shrink-0">{row.label}</span>
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-orange-400" style={{ width: row.w }} />
                              </div>
                              <span className="w-8 text-right font-mono text-[11px] text-gray-500">{row.pct}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Team AA list */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">All AAs — Coko Homes</div>
                      <div className="grid grid-cols-4 gap-2.5">
                        {(Object.keys(aaData) as AAKey[]).map((key) => {
                          const a = aaData[key];
                          return (
                            <div
                              key={key}
                              onClick={() => setSelectedView(key)}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all"
                            >
                              <div className="font-semibold text-[13px] text-gray-900 mb-1">{a.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono mb-2">{a.day}</div>
                              <div className="flex flex-wrap gap-1">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColors(a.tagClass)}`}>{a.tag}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors(a.statusClass)}`}>{a.status}</span>
                              </div>
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-500">
                                  <span>Engagement</span><span className="font-mono font-bold text-gray-700">{a.eng}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500">
                                  <span>Adaptation</span><span className="font-mono font-bold text-gray-700">{a.adapt}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500">
                                  <span>Training</span><span className="font-mono font-bold text-gray-700">{a.training}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : aa ? (
                  <div className="grid grid-cols-4 gap-2.5">
                    <MetricCard
                      label="Engagement"
                      value={<>{aa.eng.replace("%", "")}<span className="text-sm text-gray-300 font-semibold">%</span></>}
                      sub={aa.engSub} barW={aa.engW} barC={aa.engC}
                    />
                    <MetricCard
                      label="Avg Hours / Day"
                      value={<>{aa.hours.replace("h", "")}<span className="text-sm text-gray-300 font-semibold">h</span></>}
                      sub={aa.hoursSub} barW={aa.hoursW} barC={aa.hoursC}
                    />
                    <MetricCard
                      label="System Adaptation"
                      value={<>{aa.adapt.replace("%", "")}<span className="text-sm text-gray-300 font-semibold">%</span></>}
                      sub={aa.adaptSub} barW={aa.adaptW} barC={aa.adaptC}
                    />
                    <MetricCard
                      label="Pipeline Compliance"
                      value={<>{aa.pip.replace("%", "")}<span className="text-sm text-gray-300 font-semibold">%</span></>}
                      sub={aa.pipSub} barW={aa.pipW} barC={aa.pipC}
                    />
                    <MetricCard
                      label="Campaigns"
                      value={<>{aa.camp.replace("%", "")}<span className="text-sm text-gray-300 font-semibold">%</span></>}
                      sub={aa.campSub} barW={aa.campW} barC={aa.campC}
                    />
                    <MetricCard
                      label="Relationships / Day"
                      value={aa.rel}
                      sub={aa.relSub} barW={aa.relW} barC={aa.relC}
                    />
                    <MetricCard
                      label="Avg Offers / Day"
                      value={aa.off}
                      sub={aa.offSub} barW={aa.offW} barC={aa.offC}
                    />
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Deal Source</div>
                      <div className="space-y-1.5">
                        {aa.dealSource.map((row, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-28 text-gray-600 flex-shrink-0">{row.label}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-orange-400" style={{ width: row.w }} />
                            </div>
                            <span className="w-8 text-right font-mono text-[11px] text-gray-500">{row.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Section 2 — Conditions */}
            <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                <SectionNum n={2} />
                <span className="text-sm font-bold text-gray-900">
                  {isTeam ? "Your Commitments" : "Conditions for Success"}
                </span>
                <span className="text-xs text-gray-400 font-normal ml-1">
                  {isTeam ? "(Acquisition Manager Agreement)" : "(Our Agreement)"}
                </span>
                <span className="ml-auto text-xs font-medium text-orange-500">Signed Apr 9, 2026</span>
              </div>
              <div className="p-5">
                {isTeam ? (
                  <div className="grid grid-cols-2 gap-2">
                    {amConditions.map((text, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 leading-snug">
                        <div className="w-[18px] h-[18px] rounded bg-emerald-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                          {CHECK_SVG}
                        </div>
                        {text}
                      </div>
                    ))}
                  </div>
                ) : aa ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {individualConditions.map((text, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100 text-[13px] text-gray-700 leading-snug">
                          <div className="w-[18px] h-[18px] rounded bg-emerald-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                            {CHECK_SVG}
                          </div>
                          {text}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-600 font-medium">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13 4L6.5 11 3 7.5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Contract signed · {aa.name} · April 9, 2026 · Coko Homes
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Section 3 — User Training (individual only) */}
            {!isTeam && aa && (
              <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                  <SectionNum n={3} />
                  <span className="text-sm font-bold text-gray-900">User Training</span>
                  <span className="text-xs text-gray-400 font-normal ml-1">— what we showed you, and what we both agreed you know</span>
                  <span className="ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700">{aa.phase}</span>
                </div>
                <div className="p-5">
                  <div className="space-y-1.5">
                    {trainingItems.map((item, i) => {
                      const done = i < completedCount;
                      return (
                        <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] bg-gray-50">
                          <div className={`w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center border-2 ${done ? "bg-emerald-500 border-emerald-500" : "border-gray-300"}`}>
                            {done && CHECK_SVG}
                          </div>
                          <span className={done ? "text-gray-800" : "text-gray-400"}>{item.text}</span>
                          <span className="ml-auto text-[11px] font-mono text-gray-400">
                            {!done && item.isNext
                              ? <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full font-semibold text-[10px]">Next — Apr 15</span>
                              : item.date
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Section 4 (individual) / Section 3 (team) — Meeting Notes */}
            {!isTeam && aa && (
              <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
                  <SectionNum n={4} />
                  <span className="text-sm font-bold text-gray-900">Meeting Notes</span>
                  <span className="text-xs text-gray-400 font-normal ml-1">— what we discussed, and what you committed to</span>
                  <span className="ml-auto text-xs text-gray-400">Latest on top</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-2.5 bg-orange-50 border border-dashed border-orange-200 rounded-lg px-3 py-2.5 mb-4 text-xs text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#F97316" strokeWidth="1.3" /><path d="M5 8h6M5 5h4M5 11h3" stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    <span>When you save a note, a <strong className="text-orange-500">snapshot</strong> of the current dashboard metrics will be automatically attached.</span>
                  </div>
                  <div className="flex gap-2.5 mb-5">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={`What did you discuss? What did ${aa.name.split(" ")[0]} commit to? Write it here...`}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 resize-none min-h-[72px] outline-none bg-gray-50 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 placeholder:text-gray-300"
                    />
                    <div className="flex flex-col gap-1.5 justify-end">
                      <button
                        onClick={saveNote}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap"
                      >
                        💾 Save + Snapshot
                      </button>
                      <button
                        onClick={() => setNoteText("")}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  {notes.map((note, i) => (
                    <NoteCard key={i} note={note} />
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
