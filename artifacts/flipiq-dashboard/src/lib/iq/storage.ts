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
export type InboxMessage = {
  id: string;
  sender: string;
  channel: InboxChannel;
  preview: string;
  ts: string;
  unread: boolean;
};

const INBOX_KEY = "iq:inbox";

const SEED_INBOX: InboxMessage[] = [
  {
    id: "m1",
    sender: "Marcus Chen",
    channel: "text",
    preview: "Yes, I have a pocket listing in Highland Park — can talk this afternoon.",
    ts: "9:42 AM",
    unread: true,
  },
  {
    id: "m2",
    sender: "Priya Shah",
    channel: "email",
    preview: "Re: Off‑market opportunity — happy to share details, what price range?",
    ts: "9:18 AM",
    unread: true,
  },
  {
    id: "m3",
    sender: "Daniel Reyes",
    channel: "text",
    preview: "Not right now, but try me again next week.",
    ts: "8:55 AM",
    unread: true,
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
    return JSON.parse(raw) as InboxMessage[];
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
