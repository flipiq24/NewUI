import { useEffect, useMemo, useState } from "react";
import { DEAL_REVIEW_PROPERTIES, DAILY_OUTREACH_BUCKETS, NEW_RELATIONSHIPS_DEALS, type DealLevel } from "./mockData";
import { loadIqState } from "./storage";
import { isPropertyComplete, useChecklistVersion } from "./dailyChecklist";

export type IqProgressSegment = {
  key: "plan" | "deals" | "agents" | "new";
  label: string;
  count: number;
  done: boolean;
  labelTooltip: string;
  numberTooltip: string;
  route: string;
};

const PRIORITY_AGENT_CALLS = 2;

export function useIqProgress(): IqProgressSegment[] {
  const checklistVersion = useChecklistVersion();
  const [stateVersion, setStateVersion] = useState(0);

  useEffect(() => {
    const bump = () => setStateVersion((v) => v + 1);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "iq:state") bump();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("iq:state-changed", bump);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("iq:state-changed", bump);
    };
  }, []);

  return useMemo(() => {
    const state = loadIqState();

    // Active Deals
    const levelCounts: Record<DealLevel, number> = { high: 0, mid: 0, low: 0, new: 0 };
    let completed = 0;
    for (const p of DEAL_REVIEW_PROPERTIES) {
      levelCounts[p.level] += 1;
      if (isPropertyComplete(p.id)) completed += 1;
    }
    const dealsTotal = DEAL_REVIEW_PROPERTIES.length;
    const dealsRemaining = Math.max(0, dealsTotal - completed);
    const dealsDone = dealsTotal > 0 && completed === dealsTotal;
    const dealsBreakdown = (["high", "mid", "low", "new"] as DealLevel[])
      .map((l) => `${levelCounts[l]} ${l === "high" ? "high priority" : l}`)
      .join(" · ");

    // Agents
    const campaigns = DAILY_OUTREACH_BUCKETS.length;
    const agentsTotal = campaigns + PRIORITY_AGENT_CALLS;
    const agentsDone = !!(state?.outreachCampaignSent && state?.priorityAgentsComplete);

    // New Deals
    const newTotal = NEW_RELATIONSHIPS_DEALS.length;
    const newDone = !!state?.newRelationshipsComplete;

    const planDone = !!state?.flowStarted;

    return [
      {
        key: "plan",
        label: "Today's Plan",
        count: 1,
        done: planDone,
        labelTooltip: "Your morning check-in and daily plan.",
        numberTooltip: planDone
          ? "Morning check-in complete."
          : "Complete your morning check-in to set today's plan.",
        route: "/iq",
      },
      {
        key: "deals",
        label: "Active Deals",
        count: dealsRemaining,
        done: dealsDone,
        labelTooltip: "Deals that need your attention today.",
        numberTooltip: dealsDone
          ? `All ${dealsTotal} deals completed today.`
          : dealsBreakdown,
        route: "/iq/deal-review",
      },
      {
        key: "agents",
        label: "Agents",
        count: agentsTotal,
        done: agentsDone,
        labelTooltip: "Aging relationships you have, building through follow-up and nurturing.",
        numberTooltip: agentsDone
          ? "All agent outreach completed today."
          : `${campaigns} outreach campaigns to send · ${PRIORITY_AGENT_CALLS} priority agents to call`,
        route: "/iq/daily-outreach",
      },
      {
        key: "new",
        label: "New Deals",
        count: newTotal,
        done: newDone,
        labelTooltip: "Pre-sorted deals with high propensity to sell and high-value agents.",
        numberTooltip: newDone
          ? `All ${newTotal} new deal${newTotal === 1 ? "" : "s"} reviewed today.`
          : `${newTotal} preselected propert${newTotal === 1 ? "y" : "ies"} to review`,
        route: "/iq/new-relationships",
      },
    ];
  }, [checklistVersion, stateVersion]);
}
