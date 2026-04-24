export type IqState = {
  date: string;
  morningCheckin?: {
    canWorkFullDay: boolean;
    needsHelp: boolean;
    canSendOffers: boolean;
    canSendCampaigns: boolean;
    canReviewNewDeals: boolean;
    sendCampaignsNow?: "yes" | "no" | "later" | null;
    workExplain: string;
    helpExplain: string;
    offersExplain: string;
    campaignsExplain: string;
    newDealsExplain: string;
  };
  flowStarted?: boolean;
  dealReviewComplete?: boolean;
  outreachCampaignSent?: boolean;
  campaignResponsesComplete?: boolean;
  priorityAgentsComplete?: boolean;
  newRelationshipsComplete?: boolean;
};

const KEY = "iq:state";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadIqState(): IqState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IqState;
  } catch {
    return null;
  }
}

export function saveIqState(s: IqState): void {
  localStorage.setItem(KEY, JSON.stringify(s));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("iq:state-changed"));
  }
}

export function clearIqState(): IqState {
  const fresh: IqState = { date: todayStr() };
  saveIqState(fresh);
  return fresh;
}

/**
 * Reset the entire iQ day so the user lands on a fresh Morning Check-in.
 * Wipes:
 *  - the master iq:state object (morning answers + step completion flags)
 *  - per-segment "Get Started" gate flags (iqStarted:*)
 *  - per-property action checklists (iqRowActions:*)
 */
export function startNewIqDay(): IqState {
  if (typeof window !== "undefined") {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k === KEY || k.startsWith("iqStarted:") || k.startsWith("iqRowActions:")) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    try {
      localStorage.removeItem(INBOX_KEY);
      window.dispatchEvent(new CustomEvent("iq:inbox-changed"));
    } catch {
      /* ignore */
    }
  }
  return clearIqState();
}

export function resetIqStateIfNewDay(): IqState {
  const today = todayStr();
  const existing = loadIqState();
  if (existing && existing.date === today) return existing;
  const fresh: IqState = { date: today };
  saveIqState(fresh);
  return fresh;
}

export type InboxChannel = "text" | "email";
export type ThreadDirection = "in" | "out";
export type ThreadMessage = {
  id: string;
  direction: ThreadDirection;
  body: string;
  ts: string;
  subject?: string;
};
export type InboxMessage = {
  id: string;
  threadId: string;
  agentId: string;
  agentRoute: string;
  sender: string;
  senderRole?: string;
  senderPhone?: string;
  senderEmail?: string;
  channel: InboxChannel;
  subject?: string;
  preview: string;
  ts: string;
  unread: boolean;
  messages: ThreadMessage[];
};

const INBOX_KEY = "iq:inbox";

const SEED_INBOX: InboxMessage[] = [
  {
    id: "m1",
    threadId: "t-marcus-chen",
    agentId: "marcus-chen",
    agentRoute: "/iq/priority-agents?agent=marcus-chen",
    sender: "Marcus Chen",
    senderRole: "Compass · Highland Park",
    senderPhone: "(323) 555-0142",
    senderEmail: "marcus.chen@compass.com",
    channel: "text",
    preview: "Yes, I have a pocket listing in Highland Park — can talk this afternoon.",
    ts: "9:42 AM",
    unread: true,
    messages: [
      {
        id: "m1-a",
        direction: "out",
        body: "Hey Marcus — Josh at FlipIQ. Any pocket listings in Highland Park you're sitting on? We close cash, 10 days, no contingencies.",
        ts: "Yesterday 4:12 PM",
      },
      {
        id: "m1-b",
        direction: "in",
        body: "Yes, I have a pocket listing in Highland Park — can talk this afternoon.",
        ts: "9:42 AM",
      },
    ],
  },
  {
    id: "m2",
    threadId: "t-priya-shah",
    agentId: "priya-shah",
    agentRoute: "/iq/priority-agents?agent=priya-shah",
    sender: "Priya Shah",
    senderRole: "Sotheby's · Pasadena",
    senderPhone: "(626) 555-0188",
    senderEmail: "priya.shah@sothebys.com",
    channel: "email",
    subject: "Off-market opportunity",
    preview: "Re: Off-market opportunity — happy to share details, what price range?",
    ts: "9:18 AM",
    unread: true,
    messages: [
      {
        id: "m2-a",
        direction: "out",
        body: "Hi Priya,\n\nFollowing up on our last call — wanted to see if you're working any off-market listings in Pasadena or San Marino. We're an active cash buyer and can move quickly.\n\nThanks,\nJosh",
        ts: "Yesterday 4:18 PM",
        subject: "Off-market opportunity",
      },
      {
        id: "m2-b",
        direction: "in",
        body: "Hi Josh,\n\nHappy to share details — what price range are you looking at right now? I have one quietly coming up in San Marino that may be a fit.\n\nPriya",
        ts: "9:18 AM",
        subject: "Re: Off-market opportunity",
      },
    ],
  },
  {
    id: "m3",
    threadId: "t-daniel-reyes",
    agentId: "daniel-reyes",
    agentRoute: "/iq/priority-agents?agent=daniel-reyes",
    sender: "Daniel Reyes",
    senderRole: "Keller Williams · El Sereno",
    senderPhone: "(213) 555-0177",
    senderEmail: "daniel.reyes@kw.com",
    channel: "text",
    preview: "Not right now, but try me again next week.",
    ts: "8:55 AM",
    unread: true,
    messages: [
      {
        id: "m3-a",
        direction: "out",
        body: "Hi Daniel — Josh from FlipIQ. Anything pencilling in El Sereno or Lincoln Heights that needs a cash buyer?",
        ts: "8:30 AM",
      },
      {
        id: "m3-b",
        direction: "in",
        body: "Not right now, but try me again next week.",
        ts: "8:55 AM",
      },
    ],
  },
];

export function loadInbox(): InboxMessage[] {
  if (typeof window === "undefined") return SEED_INBOX;
  try {
    const raw = localStorage.getItem(INBOX_KEY);
    if (!raw) {
      saveInbox(SEED_INBOX);
      return SEED_INBOX;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (
      !Array.isArray(parsed) ||
      parsed.some(
        (m) =>
          !m ||
          typeof m !== "object" ||
          !("threadId" in (m as object)) ||
          !("agentRoute" in (m as object)) ||
          !Array.isArray((m as InboxMessage).messages)
      )
    ) {
      saveInbox(SEED_INBOX);
      return SEED_INBOX;
    }
    return parsed as InboxMessage[];
  } catch {
    return SEED_INBOX;
  }
}

export function saveInbox(msgs: InboxMessage[]): void {
  localStorage.setItem(INBOX_KEY, JSON.stringify(msgs));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("iq:inbox-changed"));
  }
}

export function inboxUnreadCount(): number {
  return loadInbox().filter((m) => m.unread).length;
}

export function markInboxRead(id: string): void {
  const msgs = loadInbox().map((m) => (m.id === id ? { ...m, unread: false } : m));
  saveInbox(msgs);
}

function nowTimeLabel(): string {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function appendThreadReply(
  threadId: string,
  body: string,
  subject?: string
): InboxMessage | null {
  const trimmed = body.trim();
  if (!trimmed) return null;

  let updated: InboxMessage | null = null;
  const msgs = loadInbox().map((m) => {
    if (m.threadId !== threadId) return m;
    const lastSubject =
      subject ??
      [...m.messages].reverse().find((x) => x.subject)?.subject ??
      m.subject;
    const newEntry: ThreadMessage = {
      id: `${m.threadId}-${m.messages.length + 1}-${Date.now()}`,
      direction: "out",
      body: trimmed,
      ts: nowTimeLabel(),
      ...(m.channel === "email" && lastSubject ? { subject: lastSubject } : {}),
    };
    const previewBody = trimmed.replace(/\s+/g, " ");
    updated = {
      ...m,
      unread: false,
      messages: [...m.messages, newEntry],
      subject: m.channel === "email" ? lastSubject ?? m.subject : m.subject,
      preview: `You: ${previewBody}`,
      ts: newEntry.ts,
    };
    return updated;
  });
  if (updated) saveInbox(msgs);
  return updated;
}

export function markAllInboxRead(): void {
  const msgs = loadInbox().map((m) => ({ ...m, unread: false }));
  saveInbox(msgs);
}

export function resetInbox(): void {
  saveInbox(SEED_INBOX);
}

export const seedDemoInbox = resetInbox;

export function allTasksComplete(s: IqState): boolean {
  return !!(
    s.dealReviewComplete &&
    s.outreachCampaignSent &&
    s.campaignResponsesComplete &&
    s.priorityAgentsComplete &&
    s.newRelationshipsComplete
  );
}

export function firstIncompleteRoute(s: IqState): string {
  if (!s.dealReviewComplete) return "/iq/deal-review";
  if (!s.outreachCampaignSent) return "/iq/daily-outreach";
  if (!s.campaignResponsesComplete) return "/iq/campaign-responses";
  if (!s.priorityAgentsComplete) return "/iq/priority-agents";
  if (!s.newRelationshipsComplete) return "/iq/new-relationships";
  return "/iq/tasks";
}
