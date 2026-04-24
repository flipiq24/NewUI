export interface FindOutMoreContent {
  steps: string[];
  videoSrc?: string;
}

export const FIND_OUT_MORE: Record<string, FindOutMoreContent> = {
  // Active Deals — overview
  ACTIVE_DEALS_OVERVIEW: {
    steps: [
      "Open the High Priority deal at the top of your queue.",
      "Call the listing agent first — text and email come after.",
      "Update the offer status and log notes inside the deal.",
      "Move to the next deal until the segment is cleared.",
      "Repeat for Pending / Backup / Hold and Closed / Expired / Canceled.",
    ],
  },
  ACTIVE_OFF_MARKET: {
    steps: [
      "Call the listing agent first — these get priority dial-out.",
      "If you reach them, log the conversation and update the offer status.",
      "If no answer, send the SMS template, then the email template.",
      "Mark the deal complete and move to the next row.",
    ],
  },
  PENDING_BACKUP_HOLD: {
    steps: [
      "Call the agent and ask whether the buyer is performing.",
      "Log what you heard so we can stay close to the deal.",
      "If it's slipping, ask to be added as backup or first-call.",
      "Update offer status and move on when you're confident.",
    ],
  },
  CLOSED_EXPIRED_CANCELED: {
    steps: [
      "Call the agent and find out who the buyer was.",
      "Note whether it sold for more or less than your offer.",
      "Ask if they have any other off-market or pocket listings.",
      "Update the relationship record before closing the row.",
    ],
  },

  // Daily Outreach
  DAILY_OUTREACH: {
    steps: [
      "Pick which buckets get an outreach today (Hot, Warm, Cold, Unknown).",
      "Choose the SMS template — short and punchy is best.",
      "Choose the email template — match the bucket's temperature.",
      "Send the campaign. Replies will land in your Inbox.",
    ],
  },

  // Campaign Responses
  CAMPAIGN_RESPONSES_OVERVIEW: {
    steps: [
      "Work Positive responses first — they're the warmest.",
      "Then Neutral — push for a yes or a clean no.",
      "Then Negative — park them per your follow-up rules.",
      "Use bulk actions when several rows need the same follow-up.",
    ],
  },
  POSITIVE_RESPONSES: {
    steps: [
      "Call every positive responder first — book a time if they pick up.",
      "Log the conversation, then send the next-step SMS or email.",
      "Mark the row handled so it drops off your queue.",
    ],
  },
  NEUTRAL_RESPONSES: {
    steps: [
      "Send the value-add follow-up to push them off the fence.",
      "If silent for 48h, queue a second touch on a different channel.",
      "Mark the row handled once the next touch is scheduled.",
    ],
  },
  NEGATIVE_RESPONSES: {
    steps: [
      "Acknowledge the no — never argue with a clear decline.",
      "Apply the Do Not Contact follow-up if they asked to be removed.",
      "Mark the row handled so they stop showing up tomorrow.",
    ],
  },

  // Priority Agents
  PRIORITY_AGENTS: {
    steps: [
      "Read the agent's record and the prompts under it before you dial.",
      "Make the call. Check off each prompt as you complete it.",
      "If they don't pick up, click Follow Up and write a quick note.",
      "Click Next Agent to advance to the next priority call.",
    ],
  },

  // New Relationships
  NEW_RELATIONSHIPS: {
    steps: [
      "Read the iQ Property Intelligence and the Propensity score.",
      "Click the address to open the property and start the call.",
      "Talk through the next steps shown on the right side of the card.",
      "Update offer status, then click Next Deal.",
    ],
  },

  // Tasks page intro / Morning check-in
  TODAYS_PLAN: {
    steps: [
      "Tasks are listed in priority order — top to bottom.",
      "Active Deals come first, then Outreach, then Responses.",
      "Then Priority Calls, then New Relationships, then end-of-day.",
      "Each task lights up green when you finish it.",
    ],
  },
  MORNING_CHECKIN: {
    steps: [
      "Tell us whether you can commit a full day.",
      "Decide if you want today's outreach campaigns to send now or later.",
      "Once both are answered we'll open Today's Plan.",
    ],
  },
};
