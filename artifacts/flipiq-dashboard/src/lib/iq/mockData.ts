export const TODAYS_TASKS = {
  properties: 426,
  agentsToMessage: 5,
  priorityAgentsToCall: 2,
  highPropensityDeals: 30,
};

export type PropertySegment = "ACTIVE_OFF_MARKET" | "PENDING_BACKUP_HOLD" | "CLOSED_EXPIRED_CANCELED";
export type DealLevel = "priority" | "high" | "mid" | "low" | "new";
export type NotificationKind = "critical" | "reminder" | "unseen" | "text";

export type ResponseStatus = "positive" | "neutral" | "negative";

export type DealProperty = {
  id: number;
  segment: PropertySegment;
  level: DealLevel;
  notifications: NotificationKind[];
  textResponse?: ResponseStatus;
  emailResponse?: ResponseStatus;
  address: string;
  type: string;
  propertyType: string;
  beds: number;
  baths: number | string;
  garage: number | string;
  year: number;
  sqft: string;
  lotSqft: string;
  pool: string;
  days: number;
  dom: number;
  cdom: number;
  price: string;
  propensityScore: number | null;
  propensityLabel: string | null;
  tags: string[];
  lastOpenDate: string;
  lastOpenNote: string;
  lastCalledDate: string;
  source: string;
  sourceStatus: string;
  offerPct: number;
  offerLabel: string;
  nextSteps: string;
  negotiator: string;
  assignedUser: string;
  statusBadge: string;
  priorityBadge: string;
};

export const DEAL_REVIEW_PROPERTIES: DealProperty[] = [
  {
    id: 1,
    segment: "ACTIVE_OFF_MARKET",
    level: "high",
    notifications: ["critical", "text"],
    textResponse: "positive",
    emailResponse: "positive",
    address: "73750 Desert Vista Court, Palm Desert, CA 92260",
    type: "STD",
    propertyType: "Condominium",
    beds: 3, baths: 2, garage: 2, year: 1976,
    sqft: "1,248ft²", lotSqft: "2,613ft²",
    pool: "In Ground, Community, Gunite, Electric Heat",
    days: 107, dom: 107, cdom: 107,
    price: "$399,000",
    propensityScore: 6, propensityLabel: "No Pain",
    tags: ["Absentee Owner", "High Equity (>50%)", "Corporate/Trust Ownership", "+1 more"],
    lastOpenDate: "04/21/26", lastOpenNote: "reopened today",
    lastCalledDate: "01/30/26",
    source: "MLS", sourceStatus: "Active",
    offerPct: 60, offerLabel: "In Negotiations",
    nextSteps: "Adjust terms",
    negotiator: "Josh Santos", assignedUser: "Josh Santos",
    statusBadge: "To do: Adjust terms", priorityBadge: "High",
  },
  {
    id: 2,
    segment: "ACTIVE_OFF_MARKET",
    level: "high",
    notifications: ["critical", "reminder"],
    textResponse: "neutral",
    address: "9283 Atsina Road, Phelan, CA 92371",
    type: "REO",
    propertyType: "Manufactured 433",
    beds: 3, baths: 2, garage: 2, year: 1986,
    sqft: "1,576ft²", lotSqft: "95,396ft²",
    pool: "None",
    days: 54, dom: 54, cdom: 108,
    price: "$335,800",
    propensityScore: 5, propensityLabel: "No Pain",
    tags: ["High Equity (>50%)", "Long-term Owner (20+ yrs)", "Corporate/Trust Ownership"],
    lastOpenDate: "12/29/25", lastOpenNote: "reopened 112 days ago",
    lastCalledDate: "12/30/25",
    source: "MLS", sourceStatus: "Pending",
    offerPct: 50, offerLabel: "Contract Submitted",
    nextSteps: "Prepare backup offer",
    negotiator: "Josh Santos", assignedUser: "Not Assigned",
    statusBadge: "To do: Prepare backup offer", priorityBadge: "High",
  },
  {
    id: 3,
    segment: "ACTIVE_OFF_MARKET",
    level: "mid",
    notifications: ["reminder", "text"],
    emailResponse: "negative",
    address: "338 W Magnolia Street, Compton, CA 90220",
    type: "STD",
    propertyType: "Other (L)",
    beds: 4, baths: 4, garage: 4, year: 1939,
    sqft: "2,360ft²", lotSqft: "7,203ft²",
    pool: "None",
    days: 131, dom: 131, cdom: 131,
    price: "$895,000",
    propensityScore: null, propensityLabel: null,
    tags: [],
    lastOpenDate: "01/01/26", lastOpenNote: "reopened 109 days ago",
    lastCalledDate: "01/01/26",
    source: "Off Market", sourceStatus: "",
    offerPct: 20, offerLabel: "Continue to Follow",
    nextSteps: "Prepare backup offer",
    negotiator: "Josh Santos", assignedUser: "Josh Santos",
    statusBadge: "To do: Prepare backup offer", priorityBadge: "High",
  },
  {
    id: 4,
    segment: "PENDING_BACKUP_HOLD",
    level: "low",
    notifications: ["reminder"],
    address: "921 Warren Street, Hayward, CA 94541",
    type: "STD",
    propertyType: "Single Family",
    beds: 3, baths: 2, garage: 3, year: 1930,
    sqft: "3,488ft²", lotSqft: "30,297ft²",
    pool: "In Ground",
    days: 133, dom: 133, cdom: 179,
    price: "$1,800,000",
    propensityScore: null, propensityLabel: null,
    tags: [],
    lastOpenDate: "01/01/26", lastOpenNote: "reopened 109 days ago",
    lastCalledDate: "01/01/26",
    source: "MLS", sourceStatus: "Back Up Offer",
    offerPct: 30, offerLabel: "Back Up",
    nextSteps: "Reminder scheduled",
    negotiator: "Josh Santos", assignedUser: "Not Assigned",
    statusBadge: "To do: Reminder scheduled", priorityBadge: "High",
  },
  {
    id: 5,
    segment: "PENDING_BACKUP_HOLD",
    level: "mid",
    notifications: ["text"],
    address: "33087 Wood St, Lake Elsinore, CA 92530",
    type: "STD",
    propertyType: "Single Family",
    beds: 2, baths: 1, garage: "N/A", year: 1947,
    sqft: "1,025ft²", lotSqft: "5,227ft²",
    pool: "None",
    days: 123, dom: 123, cdom: 123,
    price: "$299,000",
    propensityScore: 2, propensityLabel: "No Pain",
    tags: ["High Equity (>50%)"],
    lastOpenDate: "01/05/26", lastOpenNote: "opened 105 days ago",
    lastCalledDate: "N/A",
    source: "MLS", sourceStatus: "Hold",
    offerPct: 0, offerLabel: "None",
    nextSteps: "Call agent",
    negotiator: "Josh Santos", assignedUser: "Not Assigned",
    statusBadge: "To do: Not set", priorityBadge: "High",
  },
  {
    id: 6,
    segment: "CLOSED_EXPIRED_CANCELED",
    level: "high",
    notifications: ["reminder"],
    address: "132 Nissen Road 3, Salinas, CA 93901",
    type: "STD",
    propertyType: "Townhouse",
    beds: 3, baths: 2, garage: 2, year: 1985,
    sqft: "1,385ft²", lotSqft: "N/A",
    pool: "Community",
    days: 7, dom: 7, cdom: 7,
    price: "$635,000",
    propensityScore: 10, propensityLabel: "Moderate Pain",
    tags: ["Affidavit of Death", "High Equity (>50%)", "Long-term Owner (20+ yrs)", "+1 more"],
    lastOpenDate: "03/02/26", lastOpenNote: "reopened 48 days ago",
    lastCalledDate: "03/02/26",
    source: "Notification Opened", sourceStatus: "",
    offerPct: 10, offerLabel: "Initial Contact Started",
    nextSteps: "Call and update offer status",
    negotiator: "Josh Santos", assignedUser: "Josh Santos",
    statusBadge: "To do: Not set", priorityBadge: "High",
  },
  {
    id: 7,
    segment: "CLOSED_EXPIRED_CANCELED",
    level: "mid",
    notifications: ["unseen"],
    address: "902 Ballista Avenue, La Puente, CA 91744",
    type: "STD",
    propertyType: "Single Family",
    beds: 3, baths: "1.75", garage: "N/A", year: 1953,
    sqft: "1,095ft²", lotSqft: "6,431ft²",
    pool: "None",
    days: 35, dom: 35, cdom: 35,
    price: "$749,000",
    propensityScore: 5, propensityLabel: "No Pain",
    tags: ["Absentee Owner", "High Equity (>50%)", "Adjustable Rate Mortgage", "+1 more"],
    lastOpenDate: "04/14/26", lastOpenNote: "reopened 7 days ago",
    lastCalledDate: "N/A",
    source: "MLS", sourceStatus: "Cancelled",
    offerPct: 30, offerLabel: "Offer Terms Sent",
    nextSteps: "Call and update offer status",
    negotiator: "Josh Santos", assignedUser: "Not Assigned",
    statusBadge: "To do: Not set", priorityBadge: "High",
  },
  {
    id: 8,
    segment: "CLOSED_EXPIRED_CANCELED",
    level: "high",
    notifications: [],
    address: "18635 Keyes, Banning, CA 92220",
    type: "STD",
    propertyType: "Single Family",
    beds: 3, baths: 2, garage: "N/A", year: 1955,
    sqft: "1,089ft²", lotSqft: "13,068ft²",
    pool: "None",
    days: 9, dom: 9, cdom: 9,
    price: "$65,000",
    propensityScore: 7, propensityLabel: "Moderate Pain",
    tags: ["Tax Delinquency", "High Equity (>50%)"],
    lastOpenDate: "01/02/26", lastOpenNote: "reopened 109 days ago",
    lastCalledDate: "01/01/26",
    source: "MLS", sourceStatus: "Closed",
    offerPct: 80, offerLabel: "Offer Accepted",
    nextSteps: "Follow up and send offer",
    negotiator: "Josh Santos", assignedUser: "Not Assigned",
    statusBadge: "To do: Not set", priorityBadge: "High",
  },
  {
    id: 9,
    segment: "CLOSED_EXPIRED_CANCELED",
    level: "new",
    notifications: [],
    address: "9461 Lotus, Westminster, CA 92683",
    type: "STD",
    propertyType: "Single Family",
    beds: 4, baths: 3, garage: 2, year: 1962,
    sqft: "1,751ft²", lotSqft: "6,500ft²",
    pool: "None",
    days: 10, dom: 10, cdom: 10,
    price: "$1,350,000",
    propensityScore: 3, propensityLabel: "No Pain",
    tags: ["High Equity (>50%)", "Corporate/Trust Ownership", "Recent Transfer (<2 yrs)"],
    lastOpenDate: "04/15/26", lastOpenNote: "reopened 6 days ago",
    lastCalledDate: "04/14/26",
    source: "MLS", sourceStatus: "Expired",
    offerPct: 100, offerLabel: "Acquired",
    nextSteps: "Call agent",
    negotiator: "Josh Santos", assignedUser: "Not Assigned",
    statusBadge: "To do: Not set", priorityBadge: "High",
  },
];

export type OutreachBucket = {
  id: string;
  label: string;
  topBorder: string;
  labelColor: string;
  pendingColor: string;
  totalDB: number;
  pendingToday: number;
  lastCreated: string;
  lastTemplate: string;
};

export const DAILY_OUTREACH_BUCKETS: OutreachBucket[] = [
  {
    id: "hot",
    label: "HOT AGENTS",
    topBorder: "border-t-red-500",
    labelColor: "text-red-500",
    pendingColor: "text-red-500",
    totalDB: 7,
    pendingToday: 1,
    lastCreated: "03/14/26 (38 days ago)",
    lastTemplate: "Text - direct to agent test",
  },
  {
    id: "warm",
    label: "WARM AGENTS",
    topBorder: "border-t-yellow-400",
    labelColor: "text-yellow-600",
    pendingColor: "text-yellow-600",
    totalDB: 8,
    pendingToday: 1,
    lastCreated: "02/15/26 (65 days ago)",
    lastTemplate: "Email Direct to Agent - Weekly Campaigns",
  },
  {
    id: "cold",
    label: "COLD AGENTS",
    topBorder: "border-t-blue-500",
    labelColor: "text-blue-600",
    pendingColor: "text-blue-600",
    totalDB: 2,
    pendingToday: 1,
    lastCreated: "02/02/26 (78 days ago)",
    lastTemplate: "Text - direct to agent test",
  },
  {
    id: "unknown",
    label: "UNKNOWN AGENTS",
    topBorder: "border-t-gray-400",
    labelColor: "text-gray-500",
    pendingColor: "text-gray-600",
    totalDB: 21,
    pendingToday: 2,
    lastCreated: "03/17/26 (35 days ago)",
    lastTemplate: "Text - direct to agent test",
  },
];

export const PRIORITY_AGENT_JOSE = {
  name: "Jose Ponce",
  assignedTo: "Josh Santos",
  criticals: 1,
  reminders: 0,
  doNotCall: false,
  phone: "909-266-0934",
  email: "joseponce909@yahoo.com",
  company: "PONCE & PONCE REALTY, INC",
  address: "SAN BERNARDINO, SAN BERNARDINO, CA",
  lastCommunicationDate: "–",
  lastCommunicationType: "–",
  lastAddressDiscussed: "–",
  lastCommunicatedAA: "Josh Santos",
  licensedSince: 2017,
  licenseNumber: "01307544",
  activeInLast2Years: true,
  avgDealsPerYear: 56,
  doubleEnded: 0,
  investorSource: 19,
  relationshipStatus: "Priority",
  basket: "",
  agentInvestor: "Yes",
  followUpStatus: "Relationship Built",
  followUpStatusDate: "03/18/2026",
  notes: [
    {
      author: "Josh Santos",
      tags: ["Critical", "Communication"],
      age: "1mo",
      text: "Called Jose — discussed 3 active listings in San Bernardino. Very receptive. Will follow up next week with offer details.",
    },
    {
      author: "Josh Santos",
      tags: ["Communication"],
      age: "3mo",
      text: "Initial call — introduced FlipIQ. Jose is open to working with investors on distressed listings.",
    },
  ],
};

export const NEW_RELATIONSHIPS_DEALS = [
  {
    id: 1,
    address: "3025 Fairmount, Los Angeles, CA 90063",
    badge: "NOD",
    badgeColor: "bg-red-500",
    specs: "2-4 UNITS • 2Br • 2Ba • 3Gar • 1924 • 1,780ft² • 5,259ft² • Pool: None",
    days: "8 Days • DOM 8 • CDOM 8",
    tags: ["investor", "investor", "tenant", "lease", "fixer", "opportunity"],
    agentNote: "Agent has only this listing",
    price: "$749,000",
    propensityScore: 12,
    propensityLabel: "Moderate Pain",
    propensityBadge: "Notice of Default",
    propensityBadgeColor: "bg-red-500",
    propensityTags: ["Absentee Owner", "High Equity (>50%)"],
    lod: "N/A",
    lcd: "N/A",
    source: "MLS - Active",
    offerStatus: "0% None",
    nextSteps: "Call buyer agent",
    iqIntelligence: {
      tier: "Tier 2",
      summary: "DFI: Heavy Fixer + Active (8-44 DOM) + Moderate Pain + Inactive",
      property: [
        "Status: Active - 8 days",
        "Condition: Heavy Fixer (verified)",
        "Occupancy: One-bedroom unit tenant-occupied with a long-term tenant; main unit vacant",
        "Price Action: No reduction (listed at $749k)",
      ],
      seller: {
        painLevel: "Moderate Pain",
        painScore: 6,
        distressIndicators: ["RED Notice of Default (NOD) (+6 pts)"],
        whyItMatters: "Foreclosure has started — seller is behind on payments and under bank pressure.",
      },
      agent: {
        name: "AGUSTINGOMEZ",
        crmData: [
          "Active in Last 2 Years: FALSE",
          "Avg Deals Per Year: 1",
          "Double Ended: 0",
          "Investor Source: 0",
          "Buyer Agent: Call buyer's agent AGUSTINGOMEZ at (not provided)",
        ],
      },
      dynamicScript: `"AGUSTINGOMEZ, I'm calling about your listing at 3025 Fairmount. I've done my homework on you.\nWe're a tech-driven investment company that buys in your area at competitive prices — exactly where you sell.\nYour seller has Notice of Default here — time is critical.\nWe can typically get you a written offer within 24 hours and close in 10-14 days. What would it take for me to earn a shot at this one?"`,
      ifInterested: `"Perfect. I'll get you proof of funds and a written offer within 24 hours. Can you double-end this or do I need my own agent?"`,
      ifResistant: `"I understand you're probably getting a lot of calls. But I'm not a wholesaler — we're actual buyers. What would make you comfortable giving us a shot?"`,
    },
  },
];
