export type IqState = {
  date: string;
  morningCheckin?: {
    canWorkFullDay: boolean;
    needsHelp: boolean;
    workExplain: string;
    helpExplain: string;
  };
  flowStarted?: boolean;
  dealReviewComplete?: boolean;
  outreachCampaignSent?: boolean;
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
}

export function resetIqStateIfNewDay(): IqState {
  const today = todayStr();
  const existing = loadIqState();
  if (existing && existing.date === today) return existing;
  const fresh: IqState = { date: today };
  saveIqState(fresh);
  return fresh;
}

export function allTasksComplete(s: IqState): boolean {
  return !!(
    s.dealReviewComplete &&
    s.outreachCampaignSent &&
    s.priorityAgentsComplete &&
    s.newRelationshipsComplete
  );
}

export function firstIncompleteRoute(s: IqState): string {
  if (!s.dealReviewComplete) return "/iq/deal-review";
  if (!s.outreachCampaignSent) return "/iq/daily-outreach";
  if (!s.priorityAgentsComplete) return "/iq/priority-agents";
  if (!s.newRelationshipsComplete) return "/iq/new-relationships";
  return "/iq/tasks";
}
