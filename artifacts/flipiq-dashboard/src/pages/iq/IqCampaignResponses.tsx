import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqChatPage from "@/components/iq/IqChatPage";
import { resetIqStateIfNewDay, saveIqState } from "@/lib/iq/storage";
import { useStartGate } from "@/components/iq/useStartGate";

type Sentiment = "positive" | "neutral" | "negative";
type Relationship = "Priority" | "Hot" | "Warm" | "Cold" | "Unknown" | "DO NOT CONTACT";
type Basket = "Clients" | "High Value" | "Mid Value" | "Low Value" | "Prospect" | "Unknown";
type Investor = "Yes" | "No" | "Interested";
type ThreadDir = "in" | "out";

type ThreadMsg = [ThreadDir, string, string, string]; // dir, date, channel, body

type Agent = {
  id: number;
  section: Sentiment;
  name: string;
  office: string;
  phone: string;
  email: string;
  city: string;
  licenseYear: string;
  rel: Relationship;
  basket: Basket;
  investor: Investor;
  sourceCount: number | null;
  activeYr: "TRUE" | "FALSE" | "—";
  pending: number;
  backup: number;
  sold: number;
  totalDeals: number;
  otherListings: number;
  lastCommDate: string;
  lastCommType: string;
  lastAddr: string;
  lastCommAA: string;
  fuStatus: string;
  fuDate: string;
  critical: number;
  reminders: number;
  assigned: string;
  nextSteps: string;
  responseQuote: string;
  thread: ThreadMsg[];
};

export const AGENTS: Agent[] = [
  { id:1, section:"positive", name:"Jose Ponce", office:"PONCE & PONCE REALTY, INC", phone:"909-266-0934", email:"joseponce909@yahoo.com", city:"Fontana", licenseYear:"2011",
    rel:"Priority", basket:"High Value", investor:"Yes", sourceCount:19, activeYr:"TRUE",
    pending:3, backup:0, sold:54, totalDeals:57, otherListings:7,
    lastCommDate:"03/18/26", lastCommType:"Call", lastAddr:"2378 Crestview Dr, Laguna Beach", lastCommAA:"Josh Santos",
    fuStatus:"Relationship Built", fuDate:"03/18/26",
    critical:1, reminders:0, assigned:"Josh Santos",
    nextSteps:"Check in on recent listings",
    responseQuote:"Got your text — call me back, I have one in Fontana you'll like.",
    thread:[
      ["out","03/10/26","Text","Hey Jose, Josh at FlipIQ — saw your Fontana listing come up. Any flex on price or terms?"],
      ["in","03/11/26","Text","Let me check with seller and circle back this week."],
      ["out","03/17/26","Text","Following up — any update from the seller?"],
      ["in","03/18/26","Text","Got your text — call me back, I have one in Fontana you'll like."],
    ]},
  { id:6, section:"positive", name:"Christy Davenport", office:"COLDWELL BANKER REALTY", phone:"951-312-5017", email:"christydavenport1@yahoo.com", city:"Riverside", licenseYear:"2009",
    rel:"Warm", basket:"Low Value", investor:"No", sourceCount:null, activeYr:"TRUE",
    pending:1, backup:0, sold:3, totalDeals:4, otherListings:3,
    lastCommDate:"04/02/26", lastCommType:"Email", lastAddr:"—", lastCommAA:"Josh Santos",
    fuStatus:"Relationship Built", fuDate:"04/02/26",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Monthly check-in",
    responseQuote:"Always open to bring your buyers first — call anytime.",
    thread:[
      ["out","03/28/26","Email","Christy — we close fast with proof of funds. Would love to see anything Riverside that needs work."],
      ["in","04/02/26","Email","Always open to bring your buyers first — call anytime."],
    ]},

  { id:2, section:"neutral", name:"Tony Diaz", office:"Flipiq", phone:"714-581-7805", email:"tony@flipiq.com", city:"Irvine", licenseYear:"2018",
    rel:"Priority", basket:"Clients", investor:"No", sourceCount:2, activeYr:"FALSE",
    pending:0, backup:0, sold:0, totalDeals:0, otherListings:0,
    lastCommDate:"11/27/25", lastCommType:"Email", lastAddr:"—", lastCommAA:"Josh Santos",
    fuStatus:"Attempt 5", fuDate:"11/27/25",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Re-engage — platform client",
    responseQuote:"", thread:[]},
  { id:3, section:"neutral", name:"Hadaly Khoum", office:"REALTY MASTERS & ASSOCIATES", phone:"909-767-9474", email:"hadalykhoum5268@gmail.com", city:"Chino", licenseYear:"2015",
    rel:"Hot", basket:"Mid Value", investor:"No", sourceCount:11, activeYr:"TRUE",
    pending:1, backup:0, sold:8, totalDeals:9, otherListings:4,
    lastCommDate:"04/07/26", lastCommType:"Call", lastAddr:"9283 Atsina Rd, Phelan", lastCommAA:"Josh Santos",
    fuStatus:"Attempt 2", fuDate:"04/07/26",
    critical:1, reminders:1, assigned:"Josh Santos",
    nextSteps:"Second attempt — responded once",
    responseQuote:"Yes send me the details, I'm on a call back in 10.",
    thread:[
      ["out","04/06/26","Text","Hi Hadaly — Josh from FlipIQ. Interested in the Phelan property on Atsina. Cash buyer, quick close."],
      ["in","04/07/26","Text","Yes send me the details, I'm on a call back in 10."],
    ]},
  { id:4, section:"neutral", name:"Salvador Armijo", office:"CARNAVAL REALTY", phone:"626-290-0373", email:"salvadorarmijo007@gmail.com", city:"El Monte", licenseYear:"2012",
    rel:"Hot", basket:"High Value", investor:"Yes", sourceCount:null, activeYr:"TRUE",
    pending:1, backup:0, sold:2, totalDeals:3, otherListings:2,
    lastCommDate:"01/23/26", lastCommType:"Text", lastAddr:"—", lastCommAA:"Josh Santos",
    fuStatus:"Attempt 1", fuDate:"01/23/26",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Follow up on first attempt",
    responseQuote:"Appreciate the follow up. Give me till next week.",
    thread:[
      ["out","01/20/26","Text","Salvador — Josh from FlipIQ. Wanted to introduce myself. We buy SGV flips at scale."],
      ["in","01/23/26","Text","Appreciate the follow up. Give me till next week."],
    ]},
  { id:5, section:"neutral", name:"Belinda Sadberry", office:"Nelson Shelton & Associates", phone:"424-355-9140", email:"sadberryelite@gmail.com", city:"Los Angeles", licenseYear:"2017",
    rel:"Hot", basket:"Low Value", investor:"No", sourceCount:4, activeYr:"TRUE",
    pending:0, backup:0, sold:1, totalDeals:1, otherListings:1,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"First contact — cold intro",
    responseQuote:"", thread:[]},
  { id:7, section:"neutral", name:"Beberly Morales", office:"eXp Realty of California Inc", phone:"323-842-4154", email:"beberly.realestate@gmail.com", city:"Los Angeles", licenseYear:"2019",
    rel:"Warm", basket:"Low Value", investor:"No", sourceCount:4, activeYr:"TRUE",
    pending:1, backup:0, sold:0, totalDeals:1, otherListings:1,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Re-engage on pending deal",
    responseQuote:"", thread:[]},
  { id:9, section:"neutral", name:"Maria Diaz", office:"REALTY ONE GROUP ROADS", phone:"951-334-3955", email:"mdiazrealtor@gmail.com", city:"Moreno Valley", licenseYear:"2016",
    rel:"Warm", basket:"Low Value", investor:"No", sourceCount:null, activeYr:"TRUE",
    pending:1, backup:0, sold:0, totalDeals:1, otherListings:1,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"First contact needed",
    responseQuote:"", thread:[]},
  { id:10, section:"neutral", name:"Malou Toler", office:"C-21 Classic Estates", phone:"562-547-7475", email:"bluemalou@gmail.com", city:"Long Beach", licenseYear:"2010",
    rel:"Cold", basket:"High Value", investor:"No", sourceCount:null, activeYr:"TRUE",
    pending:0, backup:0, sold:0, totalDeals:0, otherListings:0,
    lastCommDate:"12/02/25", lastCommType:"Text", lastAddr:"—", lastCommAA:"Josh Santos",
    fuStatus:"Attempt 2", fuDate:"12/02/25",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Re-warm — high-value territory",
    responseQuote:"", thread:[]},
  { id:11, section:"neutral", name:"Steven Bogoyevac", office:"Steven M. Bogoyevac, Broker", phone:"562-257-1231", email:"steve.bogoyevac@marcusmillichap.com", city:"Long Beach", licenseYear:"2008",
    rel:"Unknown", basket:"Prospect", investor:"No", sourceCount:24, activeYr:"TRUE",
    pending:8, backup:0, sold:14, totalDeals:22, otherListings:12,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"High investor count — introduce",
    responseQuote:"", thread:[]},
  { id:12, section:"neutral", name:"Jerry Macias", office:"Vida Real Estate", phone:"562-544-2413", email:"jerry@meetvida.com", city:"Long Beach", licenseYear:"2014",
    rel:"Unknown", basket:"Low Value", investor:"No", sourceCount:4, activeYr:"TRUE",
    pending:0, backup:0, sold:2, totalDeals:2, otherListings:2,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Cold intro",
    responseQuote:"", thread:[]},
  { id:13, section:"neutral", name:"Susan Lubinbrownlie", office:"Coldwell Banker / Gay Dales", phone:"831-320-3001", email:"sbrownliecb@outlook.com", city:"Salinas", licenseYear:"2007",
    rel:"Unknown", basket:"Unknown", investor:"No", sourceCount:null, activeYr:"TRUE",
    pending:2, backup:2, sold:16, totalDeals:20, otherListings:8,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Strong producer — cold intro",
    responseQuote:"", thread:[]},
  { id:14, section:"neutral", name:"Matthew Hutchens", office:"Legacy Real Estate & Assoc.", phone:"650-245-2264", email:"mhutchens@legacyrea.com", city:"San Mateo", licenseYear:"2013",
    rel:"Unknown", basket:"Unknown", investor:"No", sourceCount:null, activeYr:"TRUE",
    pending:0, backup:0, sold:17, totalDeals:17, otherListings:5,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"17 sold — worth an intro",
    responseQuote:"", thread:[]},
  { id:15, section:"neutral", name:"Hilary Marks", office:"LEGACY HOMES MANAGEMENT INC", phone:"909-529-3707", email:"hilary@legacyhomesmgmt.com", city:"San Bernardino", licenseYear:"2011",
    rel:"Unknown", basket:"Low Value", investor:"No", sourceCount:3, activeYr:"TRUE",
    pending:4, backup:1, sold:23, totalDeals:28, otherListings:9,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Large pipeline — prioritize",
    responseQuote:"", thread:[]},
  { id:16, section:"neutral", name:"Tony Gonzales", office:"Vista Sotheby's International Realty", phone:"949-378-6322", email:"tony@tonygonzales.la", city:"Rancho PV", licenseYear:"2006",
    rel:"Unknown", basket:"Low Value", investor:"No", sourceCount:2, activeYr:"TRUE",
    pending:3, backup:1, sold:3, totalDeals:7, otherListings:3,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Active pipeline — cold intro",
    responseQuote:"", thread:[]},
  { id:17, section:"neutral", name:"Team Michael", office:"Keller Williams Realty", phone:"760-770-1555", email:"teammichaeloffice@gmail.com", city:"Palm Desert", licenseYear:"2012",
    rel:"Unknown", basket:"Clients", investor:"No", sourceCount:3, activeYr:"TRUE",
    pending:5, backup:0, sold:13, totalDeals:18, otherListings:6,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Client basket — confirm status",
    responseQuote:"", thread:[]},
  { id:18, section:"neutral", name:"Brian Tran", office:"HPT Realty", phone:"714-501-1770", email:"briantran3154@gmail.com", city:"Garden Grove", licenseYear:"2018",
    rel:"Unknown", basket:"High Value", investor:"No", sourceCount:2, activeYr:"TRUE",
    pending:1, backup:0, sold:0, totalDeals:1, otherListings:1,
    lastCommDate:"11/23/25", lastCommType:"Email", lastAddr:"—", lastCommAA:"Josh Santos",
    fuStatus:"Attempt 1", fuDate:"11/23/25",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Follow up on first contact",
    responseQuote:"Hey this a test number?",
    thread:[
      ["out","11/20/25","Email","Brian — Josh from FlipIQ. Introducing our buyer network."],
      ["in","11/23/25","Email","Hey this a test number?"],
    ]},
  { id:19, section:"neutral", name:"Rich Worcester", office:"Pinnacle Estate Properties, Inc.", phone:"951-500-8783", email:"rich@78homes.com", city:"Corona", licenseYear:"2015",
    rel:"Unknown", basket:"Low Value", investor:"No", sourceCount:null, activeYr:"TRUE",
    pending:0, backup:0, sold:1, totalDeals:1, otherListings:0,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Cold intro",
    responseQuote:"", thread:[]},
  { id:20, section:"neutral", name:"Miguel Briones", office:"HomeSmart", phone:"760-969-8401", email:"brionesmcarthy@gmail.com", city:"Cathedral City", licenseYear:"2020",
    rel:"Unknown", basket:"Prospect", investor:"No", sourceCount:null, activeYr:"TRUE",
    pending:0, backup:0, sold:7, totalDeals:7, otherListings:2,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Cold intro — solid sold history",
    responseQuote:"", thread:[]},
  { id:21, section:"neutral", name:"Peter Gillin", office:"—", phone:"—", email:"pdg@morganskenderian.com", city:"Newport Beach", licenseYear:"2009",
    rel:"Unknown", basket:"Unknown", investor:"No", sourceCount:4, activeYr:"TRUE",
    pending:3, backup:0, sold:1, totalDeals:4, otherListings:3,
    lastCommDate:"—", lastCommType:"—", lastAddr:"—", lastCommAA:"—",
    fuStatus:"N/A", fuDate:"—",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Email-only contact — build profile",
    responseQuote:"", thread:[]},

  { id:8, section:"negative", name:"Adam Rodell", office:"RE/MAX Select One", phone:"714-747-2117", email:"adamrodell@aol.com", city:"Anaheim", licenseYear:"2005",
    rel:"Warm", basket:"High Value", investor:"No", sourceCount:4, activeYr:"TRUE",
    pending:1, backup:0, sold:17, totalDeals:18, otherListings:6,
    lastCommDate:"01/04/26", lastCommType:"Call", lastAddr:"—", lastCommAA:"Josh Santos",
    fuStatus:"Not Interested", fuDate:"01/04/26",
    critical:0, reminders:0, assigned:"Josh Santos",
    nextSteps:"Park — circle back Q3",
    responseQuote:"Thanks but we're going direct to buyer on this one.",
    thread:[
      ["out","01/02/26","Call","Left VM about Anaheim listing."],
      ["in","01/04/26","Call","Thanks but we're going direct to buyer on this one."],
    ]},
  { id:22, section:"negative", name:"Johnyy Doeee", office:"ARIAL", phone:"—", email:"testemail@example.com", city:"—", licenseYear:"—",
    rel:"DO NOT CONTACT", basket:"Unknown", investor:"No", sourceCount:0, activeYr:"—",
    pending:0, backup:0, sold:0, totalDeals:0, otherListings:0,
    lastCommDate:"01/04/26", lastCommType:"—", lastAddr:"4036 Clairemont Dr, San Diego", lastCommAA:"Josh Santos",
    fuStatus:"Do Not Contact", fuDate:"01/04/26",
    critical:0, reminders:0, assigned:"Not Assigned",
    nextSteps:"Do not contact — flagged",
    responseQuote:"", thread:[]},
];

const UNIFIED_AGENT_ACTIONS: { key: string; label: string }[] = [
  { key: "call", label: "Call" },
  { key: "text", label: "Text" },
  { key: "email", label: "Email" },
  { key: "voicemail", label: "Text Voicemail" },
];

const SECTIONS: {
  sentiment: Sentiment;
  tail: string;
  dot: string;
  text: string;
  blurb: string;
  actions: { key: string; label: string }[];
}[] = [
  {
    sentiment: "positive",
    tail: "Positive Response",
    dot: "#5C9A2A",
    text: "#27500A",
    blurb: "Agents who responded and are engaged. Relationship Built, In Conversations, or actively interested. Call first — these are your warmest calls today.",
    actions: UNIFIED_AGENT_ACTIONS,
  },
  {
    sentiment: "neutral",
    tail: "Neutral Response",
    dot: "#9CA3AF",
    text: "#4B5563",
    blurb: "Agents in-flight. Attempts logged, no response yet, or untouched with high potential. Push for the first yes or the first no.",
    actions: UNIFIED_AGENT_ACTIONS,
  },
  {
    sentiment: "negative",
    tail: "Negative Response",
    dot: "#B83A3A",
    text: "#791F1F",
    blurb: "Agents who said no, declined campaigns, or flagged Do Not Contact. Park them. Do not re-engage outside a hard rule change.",
    actions: UNIFIED_AGENT_ACTIONS,
  },
];

const REL_STYLE: Record<Relationship, { bg: string; text: string; border: string }> = {
  "Priority":       { bg:"#EEEDFE", text:"#3C3489", border:"#CECBF6" },
  "Hot":            { bg:"#FCEBEB", text:"#791F1F", border:"#F7C1C1" },
  "Warm":           { bg:"#FAEEDA", text:"#633806", border:"#FAC775" },
  "Cold":           { bg:"#E6F1FB", text:"#0C447C", border:"#B5D4F4" },
  "Unknown":        { bg:"#F5F5F4", text:"#6B6B6B", border:"#E5E5E5" },
  "DO NOT CONTACT": { bg:"#1F1F1F", text:"#FFFFFF", border:"#1F1F1F" },
};

const BASKET_STYLE: Record<Basket, { bg: string; text: string }> = {
  "Clients":    { bg:"#EEEDFE", text:"#3C3489" },
  "High Value": { bg:"#EAF3DE", text:"#27500A" },
  "Mid Value":  { bg:"#FAEEDA", text:"#633806" },
  "Low Value":  { bg:"#F5F5F4", text:"#6B6B6B" },
  "Prospect":   { bg:"#E6F1FB", text:"#0C447C" },
  "Unknown":    { bg:"#F5F5F4", text:"#9CA3AF" },
};

const FU_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  "Relationship Built": { bg:"#EAF3DE", text:"#27500A", border:"#C0DD97" },
  "In Conversations":   { bg:"#E6F1FB", text:"#0C447C", border:"#B5D4F4" },
  "Not Interested":     { bg:"#FCEBEB", text:"#791F1F", border:"#F7C1C1" },
  "Do Not Contact":     { bg:"#1F1F1F", text:"#FFFFFF", border:"#1F1F1F" },
  "N/A":                { bg:"#F5F5F4", text:"#9CA3AF", border:"#E5E5E5" },
};
function fuStyle(s: string) {
  if (FU_STYLE[s]) return FU_STYLE[s];
  if (s.startsWith("Attempt")) return { bg:"#FAEEDA", text:"#633806", border:"#FAC775" };
  return { bg:"#F5F5F4", text:"#6B6B6B", border:"#E5E5E5" };
}

function Tip({
  children,
  title,
  rows,
  align = "left",
  width = 280,
}: {
  children: ReactNode;
  title: string;
  rows: [string, string | null | undefined][];
  align?: "left" | "right";
  width?: number;
}) {
  const visible = rows.filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== "—");
  return (
    <span className="relative group cursor-help inline-flex items-center">
      {children}
      <span
        className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute z-50 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-3 ${
          align === "right" ? "right-0" : "left-0"
        }`}
        style={{ width }}
      >
        <span className="block text-[10px] font-semibold tracking-wider uppercase text-orange-600 mb-1.5">
          {title}
        </span>
        <span className="flex flex-col gap-0.5">
          {visible.map(([k, v]) => (
            <span key={k} className="flex items-baseline justify-between gap-3 text-[12px] leading-snug">
              <span className="text-gray-500">{k}</span>
              <span className="text-gray-800 font-medium text-right">{v}</span>
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

function ThreadTip({
  quote,
  thread,
}: {
  quote: string;
  thread: ThreadMsg[];
}) {
  return (
    <span className="relative group cursor-help inline-block max-w-[260px]">
      <span className="text-[11.5px] text-gray-500 italic block truncate">"{quote}"</span>
      {thread.length > 0 && (
        <span
          className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute z-50 top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-3 w-[320px] text-left"
          style={{ whiteSpace: "normal" }}
        >
          <span className="block text-[10px] font-semibold tracking-wider uppercase text-orange-600 mb-2">
            Conversation
          </span>
          <span className="flex flex-col gap-2">
            {thread.map((m, i) => (
              <span key={i} className={`flex flex-col ${m[0] === "out" ? "items-end" : "items-start"}`}>
                <span
                  className={`text-[12px] leading-snug max-w-[85%] ${
                    m[0] === "out" ? "text-gray-500" : "text-gray-800"
                  }`}
                >
                  {m[0] === "in" ? `"${m[3]}"` : m[3]}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-gray-400 mt-0.5">
                  {m[0] === "in" ? "Agent" : "You"} · {m[2]} · {m[1]}
                </span>
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}

export default function IqCampaignResponses() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [selectedBySection, setSelectedBySection] = useState<Record<Sentiment, Set<string>>>({
    positive: new Set(),
    neutral: new Set(),
    negative: new Set(),
  });
  const [stepIdx, setStepIdx] = useState(0);
  const [callsMadeBySection, setCallsMadeBySection] = useState<Record<Sentiment, boolean>>({
    positive: false,
    neutral: false,
    negative: false,
  });
  const { started, start } = useStartGate("campaignResponses");

  // Auto-select all positive responses when entering the Positive step.
  useEffect(() => {
    if (!started) return;
    if (SECTIONS[stepIdx].sentiment !== "positive") return;
    const positives = AGENTS.filter((a) => a.section === "positive").map((a) => a.name);
    setSelectedBySection((prev) => {
      const cur = prev.positive;
      if (positives.every((n) => cur.has(n)) && cur.size === positives.length) return prev;
      return { ...prev, positive: new Set(positives) };
    });
  }, [started, stepIdx]);

  function toggleSelect(sentiment: Sentiment, name: string) {
    setSelectedBySection((prev) => {
      const next = new Set(prev[sentiment]);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { ...prev, [sentiment]: next };
    });
  }
  function setSectionSelectAll(sentiment: Sentiment, names: string[], checked: boolean) {
    setSelectedBySection((prev) => ({
      ...prev,
      [sentiment]: checked ? new Set(names) : new Set(),
    }));
  }
  function applyBulkAction(sentiment: Sentiment, label: string) {
    const sel = selectedBySection[sentiment];
    if (sel.size === 0) {
      toast({ title: "Select agents first." });
      return;
    }
    if (label === "Call") {
      setCallsMadeBySection((prev) => ({ ...prev, [sentiment]: true }));
    }
    setHandled((prev) => {
      const next = new Set(prev);
      sel.forEach((n) => next.add(n));
      return next;
    });
    setSelectedBySection((prev) => ({ ...prev, [sentiment]: new Set() }));
    toast({ title: `${label} applied to ${sel.size} agent${sel.size === 1 ? "" : "s"}.` });
  }

  useEffect(() => {
    const state = resetIqStateIfNewDay();
    const patch: Record<string, boolean> = {};
    if (!state?.dealReviewComplete) patch.dealReviewComplete = true;
    if (!state?.outreachCampaignSent) patch.outreachCampaignSent = true;
    if (Object.keys(patch).length > 0) saveIqState({ ...state, ...patch });
  }, []);

  const currentSec = SECTIONS[stepIdx];
  const isLastStep = stepIdx === SECTIONS.length - 1;
  const nextLabel = isLastStep
    ? "Agents › Priority Calls"
    : `Text and Email Campaigns › ${SECTIONS[stepIdx + 1].tail}`;

  function handleNext() {
    if (isLastStep) {
      const state = resetIqStateIfNewDay();
      saveIqState({ ...state, campaignResponsesComplete: true });
      navigate("/iq/priority-agents");
    } else {
      setStepIdx((i) => Math.min(i + 1, SECTIONS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar />
        <IqChatPage
          breadcrumbHead="Agents › Text and Email Campaigns ›"
          breadcrumbTail={currentSec.tail}
          started={started}
          onStart={start}
          briefingMessage={
            <>
              Josh, <span className="text-orange-500 font-semibold">{AGENTS.length}</span> agents responded to your text and email campaigns. We'll work them in three groups — <span className="font-semibold">Positive</span>, <span className="font-semibold">Neutral</span>, then <span className="font-semibold">Negative</span> — so each gets the right follow-up flow.
            </>
          }
          briefingItems={SECTIONS.map((s) => ({
            label: `${s.tail.toLowerCase()}`,
            count: AGENTS.filter((a) => a.section === s.sentiment).length,
          }))}
          nextTaskLabel={nextLabel}
          onNextTask={handleNext}
          instructions={
            <>
              <span className="font-semibold">Step {stepIdx + 1} of {SECTIONS.length} — {currentSec.tail}.</span>{" "}
              {currentSec.blurb} Select the agents you want to action, choose a bulk follow-up, then hit Next Task.
            </>
          }
        >
          <div className="flex flex-col gap-10">
            {SECTIONS.filter((_, i) => i === stepIdx).map((sec) => {
              const rows = AGENTS.filter((a) => a.section === sec.sentiment);
              const names = rows.map((r) => r.name);
              const sectionSel = selectedBySection[sec.sentiment];
              const allSelected = rows.length > 0 && rows.every((r) => sectionSel.has(r.name));
              const sectionHandledCount = rows.filter((r) => handled.has(r.name)).length;
              return (
                <section key={sec.sentiment}>
                  <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-gray-200">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: sec.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sec.dot }} />
                      {sec.tail}
                      <span className="text-[11px] text-gray-400 ml-1 font-normal">· {rows.length} agent{rows.length === 1 ? "" : "s"}</span>
                    </span>
                  </div>

                  {rows.length > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => setSectionSelectAll(sec.sentiment, names, e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                          />
                          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
                            Select All
                          </span>
                        </label>
                        <SectionBulkActions
                          enabled={sectionSel.size > 0}
                          count={sectionSel.size}
                          actions={sec.actions}
                          glow={sec.sentiment === "positive" && sectionSel.size > 0 && sectionHandledCount < rows.length}
                          gateCall={sec.sentiment === "positive" && !callsMadeBySection.positive}
                          onPick={(label) => applyBulkAction(sec.sentiment, label)}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        {sectionHandledCount} / {rows.length} handled
                      </span>
                    </div>
                  )}

                  {rows.length === 0 ? (
                    <p className="text-[12px] text-gray-400 italic py-2">No responses in this bucket today.</p>
                  ) : (
                    <div className="flex flex-col">
                      {rows.map((a) => (
                        <AgentRow
                          key={a.id}
                          a={a}
                          done={handled.has(a.name)}
                          isSelected={sectionSel.has(a.name)}
                          onToggle={() => toggleSelect(sec.sentiment, a.name)}
                          rowActions={sec.actions}
                          onRowAction={(label) => {
                            setHandled((prev) => {
                              const next = new Set(prev);
                              next.add(a.name);
                              return next;
                            });
                            toast({ title: `${label} applied to ${a.name}.` });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[13px] text-gray-500">
              <span className="font-semibold text-gray-800">{handled.size}</span> of {AGENTS.length} responses handled across all groups
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (stepIdx === 0) {
                    navigate("/iq/daily-outreach");
                  } else {
                    setStepIdx((i) => Math.max(0, i - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                aria-label="Back"
                title={stepIdx === 0 ? "Back to Text and Email Campaigns" : `Back: ${SECTIONS[stepIdx - 1].tail}`}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-400 cursor-pointer transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="10,3 5,8 10,13" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-4 py-2 rounded-full cursor-pointer transition-colors"
              >
                {isLastStep ? "Continue to Priority Calls" : `Next: ${SECTIONS[stepIdx + 1].tail}`}
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6,3 11,8 6,13" />
                </svg>
              </button>
            </div>
          </div>
        </IqChatPage>
      </div>
    </div>
  );
}

function AgentRow({
  a,
  done,
  isSelected,
  onToggle,
  rowActions,
  onRowAction,
}: {
  a: Agent;
  done: boolean;
  isSelected: boolean;
  onToggle: () => void;
  rowActions: { key: string; label: string }[];
  onRowAction?: (label: string) => void;
}) {
  const rel = REL_STYLE[a.rel];
  const basket = BASKET_STYLE[a.basket];
  const fu = fuStyle(a.fuStatus);
  const yearsLicensed = a.licenseYear !== "—" ? `${2026 - parseInt(a.licenseYear)} years` : "—";
  const investorDot = a.investor === "Yes" ? "#639922" : a.investor === "Interested" ? "#BA7517" : "#B4B2A9";
  const activeDot = a.activeYr === "TRUE" ? "#639922" : "#B4B2A9";
  const activeLabel = a.activeYr === "TRUE" ? "Active 2yr" : a.activeYr === "FALSE" ? "Inactive 2yr" : "Activity unknown";
  const iscDisplay = a.sourceCount === null ? "—" : String(a.sourceCount);
  const lastCommText = a.lastCommDate !== "—" ? `Last ${a.lastCommDate}` : "Never contacted";

  return (
    <div className={`grid grid-cols-[auto_1fr_auto] gap-4 py-3.5 border-b border-gray-100 last:border-0 ${done ? "opacity-60" : ""}`}>
      {/* Left rail: checkbox */}
      <div className="pt-1">
        <input
          type="checkbox"
          checked={isSelected || done}
          onChange={onToggle}
          className="w-3.5 h-3.5 accent-orange-500 cursor-pointer flex-shrink-0"
        />
      </div>

      {/* Main */}
      <div className="min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Tip
            title="Agent"
            rows={[
              ["Home city", a.city],
              ["License year", a.licenseYear],
              ["Years licensed", yearsLicensed],
              ["Assigned AA", a.assigned],
              ["Next step", a.nextSteps],
            ]}
          >
            <span className={`text-[14px] font-semibold ${done ? "line-through text-gray-400" : "text-gray-900 hover:text-orange-600"}`}>
              {a.name}
            </span>
          </Tip>
          {a.critical > 0 && (
            <Tip
              title="Critical Task"
              rows={[["Count", String(a.critical)], ["Action", a.nextSteps]]}
            >
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-semibold"
                style={{ background: "#FCEBEB", color: "#791F1F", border: "0.5px solid #F7C1C1" }}
              >
                {a.critical} Critical
              </span>
            </Tip>
          )}
          {a.reminders > 0 && (
            <Tip
              title="Reminder"
              rows={[["Count", String(a.reminders)], ["Due", a.fuDate]]}
            >
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-semibold"
                style={{ background: "#FFF7ED", color: "#9A3412", border: "0.5px solid #FED7AA" }}
              >
                {a.reminders} Reminder
              </span>
            </Tip>
          )}
        </div>

        {/* Identity line: office · phone · email */}
        <div className="flex items-center gap-2 text-[12.5px] text-gray-500 flex-wrap mb-1.5">
          <Tip
            title="Office"
            rows={[["Name", a.office], ["Assigned AA", a.assigned]]}
          >
            <span className="hover:text-gray-800">{a.office}</span>
          </Tip>
          <span className="text-gray-300">·</span>
          <span className="text-gray-700 font-medium">{a.phone}</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-700 font-medium">{a.email}</span>
        </div>

        {/* Meta row: rel pill, basket pill, investor, ISC, active, A/P/B/S, last comm */}
        <div className="flex items-center gap-2 flex-wrap text-[11.5px]">
          <Tip
            title="Relationship"
            rows={[["Status", a.rel], ["Basket", a.basket], ["Assigned AA", a.assigned]]}
          >
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
              style={{ background: rel.bg, color: rel.text, border: `0.5px solid ${rel.border}` }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: rel.text, opacity: a.rel === "DO NOT CONTACT" ? 0.9 : 0.7 }}
              />
              {a.rel}
            </span>
          </Tip>
          <Tip
            title="Basket"
            rows={[["Tier", a.basket], ["Relationship", a.rel]]}
          >
            <span
              className="inline-flex items-center px-2 py-0.5 rounded font-medium"
              style={{ background: basket.bg, color: basket.text }}
            >
              {a.basket}
            </span>
          </Tip>
          <span className="text-gray-300">·</span>
          <Tip
            title="Investor Flag"
            rows={[["Works with investors", a.investor]]}
          >
            <span className="inline-flex items-center gap-1 text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: investorDot }} />
              Investor: {a.investor}
            </span>
          </Tip>
          <span className="text-gray-300">·</span>
          <Tip
            title="Investor Source Count"
            rows={[
              ["ISC", iscDisplay],
              ["Meaning", "How many investors this agent sources to"],
              ["Signal", a.sourceCount && a.sourceCount >= 10 ? "High deal flow" : a.sourceCount && a.sourceCount >= 3 ? "Moderate flow" : a.sourceCount && a.sourceCount > 0 ? "Light flow" : "No flow yet"],
            ]}
          >
            <span className="text-gray-600">
              ISC: <span className="font-semibold" style={{ color: "#0C447C" }}>{iscDisplay}</span>
            </span>
          </Tip>
          <span className="text-gray-300">·</span>
          <Tip
            title="Activity"
            rows={[["Active in 2yrs", a.activeYr]]}
          >
            <span className="inline-flex items-center gap-1 text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeDot }} />
              {activeLabel}
            </span>
          </Tip>
          <span className="text-gray-300">·</span>
          <Tip
            title="Deal Track Record"
            rows={[
              ["Active", String(a.otherListings)],
              ["Pending", String(a.pending)],
              ["Backup", String(a.backup)],
              ["Sold", String(a.sold)],
              ["Total", String(a.totalDeals)],
            ]}
          >
            <span className="inline-flex items-center gap-1 text-gray-600">
              <span className={a.otherListings > 0 ? "text-orange-500 font-semibold" : "text-gray-400 font-medium"}>{a.otherListings}A</span>
              <span className="text-gray-300">/</span>
              <span>{a.pending}P</span>
              <span className="text-gray-300">/</span>
              <span>{a.backup}B</span>
              <span className="text-gray-300">/</span>
              <span>{a.sold}S</span>
            </span>
          </Tip>
          <span className="text-gray-300">·</span>
          <Tip
            title="Last Communication"
            rows={[
              ["Date", a.lastCommDate],
              ["Type", a.lastCommType],
              ["Address discussed", a.lastAddr],
              ["Logged by", a.lastCommAA],
            ]}
          >
            <span className="text-gray-600">{lastCommText}</span>
          </Tip>
        </div>
      </div>

      {/* Right column: follow-up status chip + response quote */}
      <div className="flex flex-col items-end gap-1.5 w-[260px] max-w-[260px]">
        <div className="flex items-start gap-2">
          <Tip
            title="Follow-Up Status"
            rows={[["Status", a.fuStatus], ["Date", a.fuDate], ["Assigned", a.assigned]]}
            align="right"
          >
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
              style={{ background: fu.bg, color: fu.text, border: `0.5px solid ${fu.border}` }}
            >
              {a.fuStatus}
            </span>
          </Tip>
          <div className="flex flex-col items-center gap-1 -mt-0.5">
            <RowMenu actions={rowActions} onPick={(label) => onRowAction?.(label)} />
            <ChatThreadIcon quote={a.responseQuote} thread={a.thread} />
            <CommIcon type={a.lastCommType} />
          </div>
        </div>
        {a.responseQuote && (
          <ThreadTip quote={a.responseQuote} thread={a.thread} />
        )}
      </div>
    </div>
  );
}

function ChatThreadIcon({ quote, thread }: { quote: string; thread: ThreadMsg[] }) {
  if (!quote && thread.length === 0) {
    return (
      <span className="text-gray-300" title="No conversation yet">
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2.5 4a1 1 0 011-1h9a1 1 0 011 1v6a1 1 0 01-1 1H6.5l-3 2.5V11h-.5a1 1 0 01-1-1V4z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="relative group">
      <button
        type="button"
        aria-label="View conversation"
        className="text-gray-400 hover:text-orange-500 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2.5 4a1 1 0 011-1h9a1 1 0 011 1v6a1 1 0 01-1 1H6.5l-3 2.5V11h-.5a1 1 0 01-1-1V4z" />
        </svg>
      </button>
      {thread.length > 0 && (
        <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute z-50 top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.08)] p-3 w-[320px] text-left">
          <span className="block text-[10px] font-semibold tracking-wider uppercase text-orange-600 mb-2">
            Conversation
          </span>
          <span className="flex flex-col gap-2">
            {thread.map((m, i) => (
              <span key={i} className={`flex flex-col ${m[0] === "out" ? "items-end" : "items-start"}`}>
                <span className={`text-[12px] leading-snug max-w-[85%] ${m[0] === "out" ? "text-gray-500" : "text-gray-800"}`}>
                  {m[0] === "in" ? `"${m[3]}"` : m[3]}
                </span>
                <span className="text-[9.5px] uppercase tracking-wider text-gray-400 mt-0.5">
                  {m[0] === "in" ? "Agent" : "You"} · {m[2]} · {m[1]}
                </span>
              </span>
            ))}
          </span>
        </span>
      )}
    </span>
  );
}

function CommIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === "text") {
    return (
      <span title="Last contact: Text" className="text-gray-400">
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 3v-3H3a1 1 0 01-1-1V4z" />
        </svg>
      </span>
    );
  }
  if (t === "email") {
    return (
      <span title="Last contact: Email" className="text-gray-400">
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3.5" width="12" height="9" rx="1" />
          <polyline points="2.5,4.5 8,9 13.5,4.5" />
        </svg>
      </span>
    );
  }
  return (
    <span title="Last contact: Call" className="text-gray-400">
      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" />
      </svg>
    </span>
  );
}

function RowMenu({
  onPick,
}: {
  actions?: { key: string; label: string }[];
  onPick: (label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const COMMUNICATION = [
    { label: "Call", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" />
      </svg>
    ) },
    { label: "Text", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 3v-3H3a1 1 0 01-1-1V4z" />
      </svg>
    ) },
    { label: "Email", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3.5" width="12" height="9" rx="1" />
        <polyline points="2.5,4.5 8,9 13.5,4.5" />
      </svg>
    ) },
    { label: "Text VM", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="6" y="2" width="4" height="8" rx="2" />
        <path d="M3.5 8a4.5 4.5 0 009 0M8 12.5V14" />
      </svg>
    ) },
  ];
  const FOLLOW_UP = [
    { label: "Set Status", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12c2-3 4-3 6 0s4 3 6 0" />
      </svg>
    ) },
    { label: "Set Reminder", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" />
        <polyline points="8,4.5 8,8 10.5,9.5" />
      </svg>
    ) },
    { label: "Set Critical", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2L14 13H2L8 2z" />
        <path d="M8 7v3M8 11.5v.5" strokeLinecap="round" />
      </svg>
    ) },
  ];
  const ORGANIZE = [
    { label: "Favorites", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2.5l1.7 3.5 3.8.5-2.8 2.7.7 3.8L8 11.2l-3.4 1.8.7-3.8L2.5 6.5l3.8-.5L8 2.5z" />
      </svg>
    ) },
    { label: "Agent Deals", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="2,3 14,3 10,9 10,13 6,13 6,9" />
      </svg>
    ) },
  ];
  const NOTES = [
    { label: "View / Add", icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="2" width="10" height="12" rx="1" />
        <path d="M5 5h6M5 8h6M5 11h4" />
      </svg>
    ) },
  ];

  function pick(label: string) {
    onPick(label);
    setOpen(false);
  }

  function Group({
    title,
    items,
  }: {
    title: string;
    items: { label: string; icon: JSX.Element }[];
  }) {
    return (
      <div className="flex flex-col min-w-[120px]">
        <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 mb-2">{title}</p>
        <div className="flex flex-col gap-1.5">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => pick(it.label)}
              className="flex items-center gap-2 text-left text-[12px] text-gray-700 hover:text-orange-600 cursor-pointer"
            >
              <span className="text-gray-400 group-hover:text-orange-500">{it.icon}</span>
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Row actions"
        className="text-gray-400 hover:text-gray-700 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="8" cy="13" r="1.4" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-30 bg-white border border-gray-200 rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.08)] px-4 py-3 flex gap-6">
          <Group title="Communication" items={COMMUNICATION} />
          <Group title="Follow Up" items={FOLLOW_UP} />
          <Group title="Organize" items={ORGANIZE} />
          <Group title="Notes" items={NOTES} />
        </div>
      )}
    </div>
  );
}

function SectionBulkActions({
  enabled,
  count,
  actions,
  onPick,
  glow = false,
  gateCall = false,
}: {
  enabled: boolean;
  count: number;
  actions: { key: string; label: string }[];
  onPick: (label: string) => void;
  glow?: boolean;
  gateCall?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={!enabled}
        onClick={() => setOpen((v) => !v)}
        className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${
          enabled
            ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        } ${glow ? "ring-2 ring-orange-300 shadow-[0_0_0_4px_rgba(251,146,60,0.35)] animate-pulse" : ""}`}
      >
        Bulk Actions{enabled ? ` · ${count}` : ""}
      </button>
      {open && enabled && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 min-w-[220px]">
          {actions.map((a) => {
            const isCall = a.label === "Call";
            const locked = gateCall && !isCall;
            const callPulse = gateCall && isCall;
            return (
              <button
                key={a.key}
                type="button"
                disabled={locked}
                title={locked ? "Call first to unlock follow-up actions" : undefined}
                onClick={() => {
                  if (locked) return;
                  onPick(a.label);
                  setOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-3 py-1.5 text-[12px] font-medium ${
                  locked
                    ? "text-gray-300 cursor-not-allowed"
                    : callPulse
                    ? "text-orange-600 font-semibold bg-orange-50 ring-1 ring-orange-300 animate-pulse hover:bg-orange-100 cursor-pointer"
                    : "text-orange-600 hover:bg-orange-50 hover:text-orange-700 cursor-pointer"
                }`}
              >
                <span>{a.label}</span>
                {locked && (
                  <svg className="w-3 h-3 text-gray-300" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="7" width="8" height="6" rx="1" />
                    <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
                  </svg>
                )}
              </button>
            );
          })}
          {gateCall && (
            <p className="px-3 pt-1.5 pb-0.5 text-[10px] text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1">
              Call first to unlock follow-ups
            </p>
          )}
        </div>
      )}
    </div>
  );
}
