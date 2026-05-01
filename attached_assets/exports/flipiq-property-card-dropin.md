# FlipiQ Property / Deal Card — Drop-in for a fresh Replit

A single self-contained React + TypeScript component that reproduces the
property row in the screenshot:

> ☐  📞 **MID** **No response — send offer**  📞● 💬● ✉●  **Critical** **Reminder**     15% Outreach Sent ▾
>                                                                                          Opened 04/22 · Called —   ← red text (cold)
> ⋮   1842 Camino Del Sol, Riverside, CA 92506 · STD · ● Keywords: Mid · Source: MLS — Active
> 💬  **525k** · 77% ARV · ● Pain: Mid · ● Agent: Not Responsive · ISC: 19 · 7A / 3P / 0B / 54S

Every chip / icon / value has a hover tooltip:
- **Next Step** — task / who / what / how / context
- **Property** — type, beds/baths, sq ft, lot, year, etc.
- **Sales Type** — code → full label (STD = Standard, REO, NOD, …)
- **Source** — source / status / negotiator / assigned
- **Price History** — every list-price change + total reduction
- **ARV** — asking vs ARV percentage
- **Seller Pain** — DOM, price drops, showings, equity, propensity
- **Last Attempts** — last 5 outreach attempts + response rate
- **Channel chips** (call / text / email) — native title shows sentiment
- **Investor Sourced Count (ISC)** — number of deals the agent has sourced to investors
- **Deal Track Record** — Active / Pending / Backup / Sold / Total
- **Listing Remarks** — public + agent comments with red `<span class="kw">` pills
- **Open History** — first / last / total opens
- **Communication History** — first / last + per-channel call/text/email totals
- **Offer Status** — completion %, stage, source, negotiator, assigned

The kebab opens a 3-column drill menu (Communication, Quick Links,
Detailed Analysis).

**Layout / UX ordering** — built for an acquisition rep's scan path:
*"do I act now → is the property worth my time → who's the agent → where is the deal"*.

1. **Row 1 — action (left):** Call CTA → **pain level chip (HIGH / MID /
   LOW)** as a colored uppercase label sitting between the phone icon
   and the next-step text → next-step text → channel chips
   (call/text/email + sentiment dot, *after* the response) → optional
   inline flags `Critical` (red) / `Reminder` (blue) as plain words —
   no pill, no box. The pain label uses the same palette as the dot
   (high = red `#E24B4A`, mid = amber `#BA7517`, low = muted gray
   `#B4B2A9`) and is *the very first thing* the rep sees after the
   phone icon, so seller motivation registers before the CTA itself.
2. **Right column — status + recency (right-aligned, stacked):**
   `60% In Negotiations ▾` on top, then `Opened MM/DD · Called MM/DD`
   underneath as **plain colored text** (no pill, no box, no
   background — just the text recolored). The color grades freshness
   against today via `gradeFreshness()`:
   - **Green** `#476B14` = ≤ 3 days (recent activity — happy state)
   - **Yellow** `#8B6210` = 4–7 days (getting stale — call soon)
   - **Red** `#A33232` = > 7 days, `—`, or `N/A` (cold / never — urgent)
   Same mental beat as the rest of the card: where am I, when was I
   last here, and *should I worry about it*. The color is the worry
   signal — no math required.
3. **Meta block — two forced lines** (separate `<div>`s). Grouped by
   *what mental question it answers* so the rep's eye scans
   top-to-bottom in priority order.
   - **Line 1 — property identity (what is it):** Address →
     world-icon → sales type → **Keywords** (next to sales type —
     keywords are *property* data) → Source/status. Pure asset
     description. This row is **`flex-nowrap` + `whitespace-nowrap`**
     with the address as the only `min-w-0 truncate` child — every
     other chip is `shrink-0`. The address truncates with `…` on
     narrow viewports (full address still in the hover tooltip).
   - **Line 2 — deal math + Pain + agent (is it worth my time + who's
     gating it):** **Compact price** (e.g. `525k`, no `$` prefix, zeros
     collapsed via `compactPrice()`) → ARV % → ● **Pain: <label>**
     (right after ARV, with the matching colored dot + Seller Pain
     tooltip) → ● **Agent** (responsiveness / gatekeeper) → ISC → Deal
     Track Record (A/P/B/S). Price is shown *without* the dollar sign
     because the column is unambiguously money — the `$` is visual
     noise. "Active Nyr" is intentionally omitted — tenure isn't
     actionable; A/P/B/S already conveys experience.
   Pain shows in **two** places on purpose: the uppercase **HIGH/MID/LOW**
   chip on Row 1 next to the phone is the at-a-glance signal (so seller
   motivation registers before the CTA itself), and `● Pain: <label>`
   on Line 2 is the inline data label sitting with the rest of the deal
   math. `Opened` and `Called` are deliberately *not* here — they're
   recency data and live with the offer status on the right.

The whole thing has **zero project-specific imports**. Just React,
TypeScript, and Tailwind. Drop it into any Replit React project.

---

## 1. Set up the Replit (skip steps you already have)

In a fresh Replit, pick the **React + Vite + TypeScript** template (or
"Vite React TS").

Inside the shell:

```bash
# Tailwind v3 (the card uses arbitrary-value classes that work in v3+)
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

Edit `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Make sure `src/index.css` (or wherever your global stylesheet lives)
starts with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

And that it's imported in `src/main.tsx`:

```ts
import "./index.css";
```

---

## 2. Drop in the card

Create `src/DealCard.tsx` and paste the entire block below.

```tsx
import { useState, useEffect, useRef, type ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────
   TYPES
   ──────────────────────────────────────────────────────────────── */

export type ResponseStatus = "positive" | "neutral" | "negative";
export type NotificationKind = "critical" | "reminder" | "unseen" | "text";

export type DealProperty = {
  id: number | string;
  address: string;
  type: string;          // sales type code, e.g. "STD", "REO"
  propertyType: string;  // e.g. "SFR", "Condo"
  price: string;         // formatted, e.g. "$525,000"
  source: string;        // e.g. "MLS — Active"
  sourceStatus: string;  // e.g. "Active"
  offerPct: number;      // 0–100
  offerLabel: string;    // e.g. "Outreach Sent"
  nextSteps: string;     // e.g. "No response — send offer"
  negotiator: string;
  assignedUser: string;
  lastOpenDate: string;
  lastCalledDate: string;
  callResponse?: ResponseStatus;
  textResponse?: ResponseStatus;
  emailResponse?: ResponseStatus;
  /**
   * Inline flags rendered as plain words on Row 1 after the channel chips.
   * "critical" → red, "reminder" → blue. No pill, no box.
   */
  notifications?: NotificationKind[];
};

export type DealDetail = {
  // Next-step tooltip
  taskNote: string;
  taskWho?: string;
  taskWhat?: string;
  taskHow?: string;

  // Property tooltip
  prop: [string, string][];

  // ARV
  arv: string;
  arvPct: string;

  // Price history
  priceHist: [string, string][];
  priceTotal: string;

  // Pain
  pain: "high" | "mid" | "low" | "none";
  painLabel: string;
  painSig: [string, string][];

  // Agent
  agent: "responsive" | "not-responsive" | "none";
  agentLabel: string;
  agentComms: [string, string][];
  agentRate: string;

  // Keywords / listing remarks
  kw: "high" | "mid" | "low";
  kwLabel: string;
  pubCmt: string;  // may contain <span class="kw">...</span>
  agtCmt: string;

  // Open / call history
  opened: string;
  called: string;
  firstOpened: string;
  totalOpens: number;
  firstCalled: string;
  totalCommsCount: number;
  totalCalls: number;
  totalTexts: number;
  totalEmails: number;

  // Offer status
  pct: string;
  status: string;
  statusType: "neg" | "bu" | "init" | "none";
  source: string;
  negotiator: string;
  assigned: string;

  // Agent deal track record (NEW — shows on row 3 after "Agent")
  isc?: number;          // ISC count, e.g. 19
  activeYears?: string;  // e.g. "2yr"
  trackActive?: number;  // 7
  trackPending?: number; // 3
  trackBackup?: number;  // 0
  trackSold?: number;    // 54
  trackTotal?: number;   // 57
};

/* ────────────────────────────────────────────────────────────────
   STYLE MAPS
   ──────────────────────────────────────────────────────────────── */

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

const PAIN_DOT: Record<DealDetail["pain"], string> = {
  high: "bg-[#E24B4A]",
  mid:  "bg-[#BA7517]",
  low:  "bg-[#B4B2A9]",
  none: "bg-[#B4B2A9]",
};
const PAIN_TEXT: Record<DealDetail["pain"], string> = {
  high: "text-[#E24B4A]",
  mid:  "text-[#BA7517]",
  low:  "text-[#B4B2A9]",
  none: "text-[#B4B2A9]",
};

/**
 * Recency tint for the Opened / Called timestamps on the right of the card.
 * Plain colored text only — no pill, no background, no padding.
 * Green = recent (≤3 days), yellow = getting stale (4–7 days),
 * red = cold or never (>7 days, "—", "N/A").
 */
const FRESHNESS: Record<"fresh" | "stale" | "cold", string> = {
  fresh: "text-[#476B14]", // green
  stale: "text-[#8B6210]", // yellow
  cold:  "text-[#A33232]", // red
};

/** Grade an "MM/DD" or "MM/DD/YY" string against today. */
function gradeFreshness(mmdd: string): keyof typeof FRESHNESS {
  if (!mmdd || mmdd === "—" || /n\/?a/i.test(mmdd)) return "cold";
  const m = mmdd.match(/^(\d{1,2})\/(\d{1,2})/);
  if (!m) return "cold";
  const today = new Date();
  const month = Number(m[1]);
  const day = Number(m[2]);
  // MM/DD has no year — assume current year, roll back if month is in the future.
  let year = today.getFullYear();
  if (month > today.getMonth() + 1) year -= 1;
  const then = new Date(year, month - 1, day);
  const days = Math.floor((today.getTime() - then.getTime()) / 86_400_000);
  if (days < 0) return "fresh";
  if (days <= 3) return "fresh";
  if (days <= 7) return "stale";
  return "cold";
}

/**
 * "$525,000" → "525k", "$1,250,000" → "1.25m", "$335,800" → "336k".
 * The meta row drops the "$" prefix and collapses zeros for scannability.
 */
function compactPrice(raw: string): string {
  const n = Number(String(raw).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return raw;
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2).replace(/\.?0+$/, "")}m`;
  }
  return `${Math.round(n / 1000)}k`;
}

const AGENT_DOT: Record<DealDetail["agent"], string> = {
  responsive:       "bg-[#639922]",
  "not-responsive": "bg-[#E24B4A]",
  none:             "bg-[#B4B2A9]",
};
const KW_DOT: Record<DealDetail["kw"], string> = {
  high: "bg-[#639922]",
  mid:  "bg-[#BA7517]",
  low:  "bg-[#B4B2A9]",
};

const SALES_TYPE_LABELS: Record<string, string> = {
  STD:  "Standard",
  SPAY: "Short Sale",
  NOD:  "Notice Of Default",
  REO:  "REO",
  PRO:  "Probate Listing",
  AUC:  "Auction",
  TRUS: "Trust",
  TPA:  "Third Party Approval",
  HUD:  "HUD Owned",
  BK:   "Bankruptcy Property",
  FORC: "In Foreclosure",
  CONS: "Conservatorship",
};

const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active:                { bg: "#EAF3DE", text: "#27500A", dot: "#5C9A2A" },
  pending:               { bg: "#FAEEDA", text: "#854F0B", dot: "#C58323" },
  "back up offer":       { bg: "#E6F1FB", text: "#185FA5", dot: "#2F86D6" },
  hold:                  { bg: "#EEEDFE", text: "#534AB7", dot: "#7A6FE0" },
  closed:                { bg: "#F1EFE8", text: "#2C2C2A", dot: "#5A5A56" },
  expired:               { bg: "#FCEBEB", text: "#791F1F", dot: "#B83A3A" },
  cancelled:             { bg: "#FCEBEB", text: "#A32D2D", dot: "#D45656" },
  "notification opened": { bg: "#FFF7ED", text: "#9A3412", dot: "#D67432" },
  "off market":          { bg: "#F4F2EE", text: "#4B5563", dot: "#9CA3AF" },
};
function sourceKey(source: string, status: string) {
  const s = (status || source.replace(/^MLS\s*—\s*/i, "")).trim().toLowerCase();
  return s in SOURCE_COLORS ? s : source.trim().toLowerCase();
}
function sourceTextColor(source: string, status: string): string {
  const c = SOURCE_COLORS[sourceKey(source, status)] ?? SOURCE_COLORS["off market"];
  return c.text;
}

const STATUS_PILL: Record<DealDetail["statusType"], string> = {
  neg: "text-gray-700", bu: "text-gray-700", init: "text-gray-700", none: "text-gray-700",
};

/* ────────────────────────────────────────────────────────────────
   ICONS
   ──────────────────────────────────────────────────────────────── */

const ICON = {
  kebab:  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><circle cx="8" cy="3" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="8" cy="13" r="1.4" /></svg>,
  chat:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5"><path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v6a1 1 0 01-1 1H6l-3 2v-2H3a1 1 0 01-1-1V4z" /></svg>,
  globe:  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-3 h-3"><circle cx="6" cy="6" r="5" /><line x1="1" y1="6" x2="11" y2="6" /><path d="M6 1c1.5 1.5 1.5 8.5 0 10M6 1c-1.5 1.5-1.5 8.5 0 10" /></svg>,
  phone:  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" /></svg>,
  caret:  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-2.5 h-2.5 opacity-70"><polyline points="3,5 6,8 9,5" /></svg>,
  chPhone:<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 2.5h2.5l1.2 3-1.5 1A8 8 0 0010.5 11l1-1.5 3 1.2v2.5a1 1 0 01-1 1C7 14.2 1.8 9 1.8 3.5a1 1 0 011-1z" /></svg>,
  chText: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3.5h12v7H6.5L3.5 13v-2.5H2v-7z" /></svg>,
  chMail: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><rect x="2" y="3.5" width="12" height="9" rx="1" /><polyline points="2.5,4.5 8,9 13.5,4.5" strokeLinecap="round" /></svg>,
};

/* ────────────────────────────────────────────────────────────────
   TOOLTIP PANEL
   ──────────────────────────────────────────────────────────────── */

function TipPanel({
  title, rows, total, align = "left", wide = false, children,
}: {
  title: string;
  rows?: [string, string][];
  total?: string;
  align?: "left" | "right";
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1.5 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-left ${
        wide ? "min-w-[330px] max-w-[400px]" : "min-w-[240px] max-w-[300px]"
      } ${align === "right" ? "right-0" : "left-0"}`}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-orange-600 mb-1.5">
        {title}
      </div>
      {rows?.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3.5 py-[1.5px] text-[12px]">
          <span className="text-gray-400">{k}</span>
          <span className="text-gray-900 font-medium">{v}</span>
        </div>
      ))}
      {total && (
        <div className="flex justify-between gap-3.5 mt-1.5 pt-1.5 border-t border-gray-200 text-[12px]">
          <span className="text-gray-400">Total reduction</span>
          <span className="text-gray-900 font-medium">{total}</span>
        </div>
      )}
      {children}
    </div>
  );
}

/* Renders pubCmt/agtCmt with <span class="kw">…</span> styled as red pills. */
function KwHtml({ html }: { html: string }) {
  const parts = html.split(/(<span class="kw">.*?<\/span>)/g);
  return (
    <p className="text-[12px] text-gray-900 leading-snug m-0">
      {parts.map((part, i) => {
        const m = part.match(/^<span class="kw">(.*?)<\/span>$/);
        if (m) {
          return (
            <span key={i} className="inline-block bg-red-500 text-white px-1.5 py-px rounded font-medium text-[10.5px] tracking-wide mx-0.5">
              {m[1]}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

/* ────────────────────────────────────────────────────────────────
   CHANNEL CHIPS  (call/text/email + sentiment dot)
   ──────────────────────────────────────────────────────────────── */

function ChannelChips({ property }: { property: DealProperty }) {
  const channels: { key: string; icon: ReactNode; label: string; status: ResponseStatus }[] = [];
  if (property.callResponse)  channels.push({ key: "call",  icon: ICON.chPhone, label: "Call",  status: property.callResponse });
  if (property.textResponse)  channels.push({ key: "text",  icon: ICON.chText,  label: "Text",  status: property.textResponse });
  if (property.emailResponse) channels.push({ key: "email", icon: ICON.chMail,  label: "Email", status: property.emailResponse });
  if (channels.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-2.5">
      {channels.map((c) => (
        <span
          key={c.key}
          title={`${c.label}: ${RESPONSE_LABEL[c.status]}`}
          aria-label={`${c.label}: ${RESPONSE_LABEL[c.status]}`}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 cursor-help"
        >
          {c.icon}
          <span className={`w-1.5 h-1.5 rounded-full ${RESPONSE_DOT[c.status]}`} />
        </span>
      ))}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────
   KEBAB DRILL MENU
   ──────────────────────────────────────────────────────────────── */

const MENU_ITEMS = {
  comm:   ["Call", "Text", "Email", "Text Voicemail", "AI Connect"],
  quick:  ["Notes", "Tax Data", "Activities", "Create Reminder", "AI Report"],
  detail: ["PIQ", "Comps", "Investment Analysis", "Offer Terms", "Agent"],
};

function DrillMenu({
  open, onClose, onCall,
}: { open: boolean; onClose: () => void; onCall: () => void }) {
  if (!open) return null;
  return (
    <div
      className="absolute top-0 left-[calc(100%+8px)] bg-white border border-gray-300 rounded-lg shadow-lg p-2.5 z-50 min-w-[600px] grid grid-cols-3 gap-x-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div>
        <h5 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-1.5 mb-1">Communication</h5>
        {MENU_ITEMS.comm.map((label) => (
          <button
            key={label} type="button"
            onClick={() => { if (label === "Call") { onCall(); onClose(); } }}
            className="w-full text-left px-2 py-1.5 text-[13px] text-gray-900 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap"
          >{label}</button>
        ))}
      </div>
      <div>
        <h5 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-1.5 mb-1">Quick Links</h5>
        {MENU_ITEMS.quick.map((label) => (
          <button key={label} type="button" className="w-full text-left px-2 py-1.5 text-[13px] text-gray-900 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap">{label}</button>
        ))}
      </div>
      <div>
        <h5 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-1.5 mb-1">Detailed Analysis</h5>
        {MENU_ITEMS.detail.map((label) => (
          <button key={label} type="button" className="w-full text-left px-2 py-1.5 text-[13px] text-gray-900 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap">{label}</button>
        ))}
      </div>
      <div className="col-span-3 mt-1.5 pt-2 border-t border-gray-200">
        <button type="button" className="w-full text-left px-2 py-1.5 text-[13px] font-semibold text-orange-700 hover:bg-orange-50 rounded cursor-pointer">
          Auto Tracker
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────────────────────────── */

export default function DealCard({
  property, detail,
}: {
  property: DealProperty;
  detail: DealDetail;
}) {
  const [done, setDone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!rowRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  const triggerCall = () => { setMenuOpen(false); setNudgeOpen(true); };

  return (
    <div
      ref={rowRef}
      className={`grid grid-cols-[16px_1fr_auto] gap-4 px-2 py-3 border-b border-gray-100 last:border-b-0 hover:bg-[#FAFAF9] transition-colors relative ${done ? "opacity-60" : ""}`}
    >
      {/* Left rail: checkbox, kebab, chat */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <input
          type="checkbox"
          checked={done}
          onChange={() => setDone((d) => !d)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
        />
        <div className="relative">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
            className="text-gray-400 hover:text-gray-700 cursor-pointer leading-none"
          >{ICON.kebab}</button>
          <DrillMenu open={menuOpen} onClose={() => setMenuOpen(false)} onCall={triggerCall} />
        </div>
        <div className="relative group mt-1">
          <button type="button" className="text-gray-400 hover:text-gray-700 cursor-pointer">
            {ICON.chat}
          </button>
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1.5 left-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg px-2.5 py-1.5 text-[12px] text-gray-900 whitespace-nowrap">
            View conversations
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="min-w-0">
        {/* Row 1 — Call CTA → next step → channel chips → inline flags */}
        <div className="flex items-center gap-2.5 mb-1">
          <button
            type="button"
            onClick={triggerCall}
            title={done ? "Call logged" : "Call this agent first"}
            className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer ${
              done
                ? "bg-white border-[1.5px] border-orange-500 text-orange-600"
                : "bg-orange-50 border border-orange-300 text-orange-600 hover:bg-orange-500 hover:text-white ring-2 ring-orange-300 shadow-[0_0_0_3px_rgba(251,146,60,0.35)] animate-pulse"
            }`}
          >
            {done ? (
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,8 7,12 13,4" />
              </svg>
            ) : ICON.phone}
          </button>
          {/* Pain level (HIGH / MID / LOW) — between the phone icon and the
              CTA. Same palette as the dot. Seller motivation registers
              before the CTA itself. */}
          {detail.pain !== "none" && (
            <span className="relative group cursor-help shrink-0">
              <span className={`text-[12px] font-semibold uppercase tracking-wide ${PAIN_TEXT[detail.pain]}`}>
                {detail.painLabel}
              </span>
              <TipPanel title="Seller Pain" rows={detail.painSig} />
            </span>
          )}
          <span className="relative group cursor-help">
            <span className={`text-[15px] font-semibold leading-snug ${done ? "text-gray-400 line-through" : "text-orange-600 group-hover:text-orange-700"}`}>
              {property.nextSteps}
            </span>
            <TipPanel
              title="Next Step" wide
              rows={[
                ["Task", property.nextSteps],
                ...(detail.taskWho  ? ([["Who",  detail.taskWho]]  as [string, string][]) : []),
                ...(detail.taskWhat ? ([["What", detail.taskWhat]] as [string, string][]) : []),
                ...(detail.taskHow  ? ([["How",  detail.taskHow]]  as [string, string][]) : []),
                ["Context", detail.taskNote],
              ]}
            />
          </span>
          {/* Channel chips after the next-step response */}
          <ChannelChips property={property} />
          {/* Inline flags — plain words, no box, no pill */}
          {property.notifications?.includes("critical") && (
            <span className="text-[12px] font-semibold text-[#E24B4A]">Critical</span>
          )}
          {property.notifications?.includes("reminder") && (
            <span className="text-[12px] font-semibold text-[#2F86D6]">Reminder</span>
          )}
        </div>

        {/* Line 1 — property identity (what is it).
            flex-nowrap + whitespace-nowrap + min-w-0 truncate on the address
            keep this row on EXACTLY one visual line. Address gets `…` on
            narrow viewports (full text in the hover tooltip). Price /
            ARV / Pain live on Line 2; the at-a-glance pain chip also
            appears on Row 1 next to the phone. */}
        <div className="flex items-center flex-nowrap min-w-0 gap-x-2 text-[13px] text-gray-700 leading-6 whitespace-nowrap">
          <span className="relative group cursor-help min-w-0 truncate">
            <span className="group-hover:text-gray-900">{property.address}</span>
            <TipPanel title="Property" rows={detail.prop} />
          </span>
          <button type="button" className="shrink-0 text-gray-400 hover:text-orange-500 cursor-pointer">
            {ICON.globe}
          </button>
          <span className="shrink-0 text-gray-300">·</span>
          <span className="shrink-0 relative group cursor-help text-gray-700 font-medium hover:text-gray-900">
            {property.type}
            <TipPanel
              title="Sales Type"
              rows={[
                ["Sales Type",   `${property.type} — ${SALES_TYPE_LABELS[property.type.toUpperCase()] ?? property.type}`],
                ["Property Type", property.propertyType],
              ]}
            />
          </span>
          <span className="shrink-0 text-gray-300">·</span>
          {/* Keywords — right after sales type (it's property data) */}
          <span className="shrink-0 relative group cursor-help inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900">
            <span className={`w-1.5 h-1.5 rounded-full ${KW_DOT[detail.kw]}`} />
            Keywords: {detail.kwLabel}
            <TipPanel title="Listing Remarks" wide>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-1.5 mb-1">Public Comments</div>
              <KwHtml html={detail.pubCmt} />
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mt-2 mb-1">Agent Comments</div>
              <KwHtml html={detail.agtCmt} />
            </TipPanel>
          </span>
          <span className="shrink-0 text-gray-300">·</span>
          <span className="shrink-0 relative group cursor-help text-gray-500 hover:text-gray-900">
            Source:{" "}
            <span className="text-gray-700 font-medium">
              {property.source.replace(/\s*—\s*.*$/, "")}
              {property.sourceStatus || /\s*—\s*/.test(property.source) ? " — " : ""}
            </span>
            <span className="font-medium" style={{ color: sourceTextColor(property.source, property.sourceStatus) }}>
              {property.sourceStatus || (property.source.match(/\s*—\s*(.*)$/)?.[1] ?? "")}
            </span>
            <TipPanel
              title="Source"
              rows={[
                ["Source", property.source],
                ...(property.sourceStatus ? ([["Status", property.sourceStatus]] as [string, string][]) : []),
                ["Negotiator", detail.negotiator],
                ["Assigned",   detail.assigned],
              ]}
            />
          </span>
        </div>

        {/* Line 2 — deal math + Pain + agent.
            Compact price (no "$", zeros collapsed: 525k) + ARV % +
            ● Pain: <label> + agent responsiveness + ISC + Deal Track Record (A/P/B/S).
            Pain shows here as the inline data label; the Row 1 chip is the
            at-a-glance signal. */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[13px] text-gray-700 leading-6">
          <span className="relative group cursor-help font-semibold text-gray-900">
            {compactPrice(property.price)}
            <TipPanel title="Price History" rows={detail.priceHist} total={detail.priceTotal} />
          </span>
          <span className="text-gray-300">·</span>
          <span className="relative group cursor-help font-medium text-gray-700">
            {detail.arvPct}
            <TipPanel title="ARV" rows={[["Asking", property.price], ["ARV", detail.arv], ["Asking vs ARV", detail.arvPct]]} />
          </span>
          <span className="text-gray-300">·</span>
          <span className="relative group cursor-help inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900">
            <span className={`w-1.5 h-1.5 rounded-full ${PAIN_DOT[detail.pain]}`} />
            Pain: {detail.painLabel}
            <TipPanel title="Seller Pain" rows={detail.painSig} />
          </span>
          <span className="text-gray-300">·</span>
          <span className="relative group cursor-help inline-flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-900">
            <span className={`w-1.5 h-1.5 rounded-full ${AGENT_DOT[detail.agent]}`} />
            Agent: {detail.agentLabel}
            <TipPanel title="Last Attempts" rows={detail.agentComms}>
              <div className="flex justify-between gap-3.5 mt-1.5 pt-1.5 border-t border-gray-200 text-[12px]">
                <span className="text-gray-400">Response rate</span>
                <span className="text-gray-900 font-medium">{detail.agentRate}</span>
              </div>
            </TipPanel>
          </span>
          <span className="text-gray-300">·</span>
          {/* ISC — Investor Sourced Count (own tooltip) */}
          <span className="relative group cursor-help inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-900">
            <span>ISC: <span className="font-medium text-gray-700">{detail.isc ?? 19}</span></span>
            <TipPanel
              title="Investor Sourced Count"
              rows={[
                ["ISC",     String(detail.isc ?? 19)],
                ["Meaning", "Number of deals this agent has sourced to investors."],
              ]}
            />
          </span>
          <span className="text-gray-300">·</span>
          {/* Agent deal track record — A/P/B/S only ("Active Nyr" intentionally omitted) */}
          <span className="relative group cursor-help inline-flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-900">
            <span className="font-medium text-gray-700 tabular-nums">
              {detail.trackActive ?? 7}A / {detail.trackPending ?? 3}P / {detail.trackBackup ?? 0}B / {detail.trackSold ?? 54}S
            </span>
            <TipPanel
              title="Deal Track Record"
              rows={[
                ["Active",  String(detail.trackActive  ?? 7)],
                ["Pending", String(detail.trackPending ?? 3)],
                ["Backup",  String(detail.trackBackup  ?? 0)],
                ["Sold",    String(detail.trackSold    ?? 54)],
                ["Total",   String(detail.trackTotal   ?? 57)],
              ]}
            />
          </span>
        </div>

        {/* Post-call nudge */}
        {nudgeOpen && (
          <div className="mt-2.5 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md flex items-center justify-between gap-2.5 flex-wrap text-[12.5px] text-orange-900">
            <span>✓ Call logged. <span className="font-medium">Send text + email follow-up?</span></span>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setNudgeOpen(false)} className="px-2.5 py-1 bg-gray-900 text-white rounded text-[11.5px] font-medium cursor-pointer hover:bg-gray-800">Yes, send both</button>
              <button type="button" onClick={() => setNudgeOpen(false)} className="px-2.5 py-1 bg-transparent text-gray-600 border border-gray-300 rounded text-[11.5px] cursor-pointer hover:bg-gray-50">Not yet</button>
            </div>
          </div>
        )}
      </div>

      {/* Status + recency (last touched) — the right-side "where am I" column */}
      <div className="flex flex-col items-end pt-1 gap-0.5 whitespace-nowrap">
        <span className={`relative group cursor-pointer inline-flex items-center gap-1 text-[12px] font-medium hover:text-gray-900 ${STATUS_PILL[detail.statusType]}`}>
          <span className="font-semibold">{detail.pct}</span>
          <span>{detail.status}</span>
          {ICON.caret}
          <TipPanel
            title="Offer Status" align="right"
            rows={[
              ["Completion", detail.pct],
              ["Stage",      detail.status],
              ["Source",     detail.source],
              ["Negotiator", detail.negotiator],
              ["Assigned",   detail.assigned],
            ]}
          />
        </span>
        <div className="inline-flex items-center gap-1.5 text-[11.5px] text-gray-500">
          {/* Plain colored text — green = ≤3d, yellow = 4–7d, red = cold/never. No pills, no boxes. */}
          <span className={`relative group cursor-help font-medium ${FRESHNESS[gradeFreshness(detail.opened)]}`}>
            Opened {detail.opened}
            <TipPanel
              title="Open History" align="right"
              rows={[["First opened", detail.firstOpened], ["Last opened", detail.opened], ["Total opens", String(detail.totalOpens)]]}
            />
          </span>
          <span className="text-gray-300">·</span>
          <span className={`relative group cursor-help font-medium ${FRESHNESS[gradeFreshness(detail.called)]}`}>
            Called {detail.called}
            <TipPanel
              title="Communication History" align="right"
              rows={[["First call", detail.firstCalled], ["Last call", detail.called], ["Total comms", String(detail.totalCommsCount)]]}
            >
              <div className="mt-1.5 pt-1.5 border-t border-gray-200">
                <div className="flex justify-between gap-3.5 py-[1.5px] text-[12px]"><span className="text-gray-400">Calls</span><span className="text-gray-900 font-medium">{detail.totalCalls}</span></div>
                <div className="flex justify-between gap-3.5 py-[1.5px] text-[12px]"><span className="text-gray-400">Texts</span><span className="text-gray-900 font-medium">{detail.totalTexts}</span></div>
                <div className="flex justify-between gap-3.5 py-[1.5px] text-[12px]"><span className="text-gray-400">Emails</span><span className="text-gray-900 font-medium">{detail.totalEmails}</span></div>
              </div>
            </TipPanel>
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Sample data + usage (matches the screenshot)

Create `src/App.tsx`:

```tsx
import DealCard, { type DealProperty, type DealDetail } from "./DealCard";

const property: DealProperty = {
  id: 1,
  address: "1842 Camino Del Sol, Riverside, CA 92506",
  type: "STD",
  propertyType: "SFR",
  price: "$525,000",
  source: "MLS — Active",
  sourceStatus: "Active",
  offerPct: 15,
  offerLabel: "Outreach Sent",
  nextSteps: "No response — send offer",
  negotiator: "Josh Santos",
  assignedUser: "Josh Santos",
  lastOpenDate: "04/22",
  lastCalledDate: "—",
  callResponse: "negative",
  emailResponse: "negative",
  notifications: ["critical", "reminder"], // → red "Critical" + blue "Reminder" inline on Row 1
};

const detail: DealDetail = {
  taskNote: "Agent has gone dark. Send your standard cash offer at 77% ARV.",
  taskWho:  "Listing agent — Maria Lopez",
  taskWhat: "Send written offer (DocuSign) and notify via text + email.",
  taskHow:  "Use template OFFER-CASH-77 with 14-day close.",

  prop: [
    ["Type",        "SFR · STD"],
    ["Beds / Baths","3 / 2"],
    ["Sqft",        "1,640"],
    ["Year",        "1968"],
    ["Lot",         "7,200 sqft"],
  ],

  arv:    "$680,000",
  arvPct: "77% ARV",

  priceHist: [
    ["Original list", "$549,900"],
    ["10/01",         "$535,000"],
    ["10/18",         "$525,000"],
  ],
  priceTotal: "-$24,900",

  pain:      "mid",
  painLabel: "Mid",
  painSig: [
    ["DOM",          "47"],
    ["Price drops",  "2"],
    ["Showings/wk",  "1.2"],
  ],

  agent:      "not-responsive",
  agentLabel: "Not Responsive",
  agentComms: [
    ["04/19", "Call — no answer, no VM"],
    ["04/20", "Text — delivered, no reply"],
    ["04/22", "Email — opened, no reply"],
  ],
  agentRate: "0%",

  kw:       "mid",
  kwLabel:  "Mid",
  pubCmt:   `Charming home in established neighborhood. <span class="kw">Motivated seller</span>, bring all offers.`,
  agtCmt:   `<span class="kw">Vacant</span>, lockbox on front door. Go direct.`,

  opened:          "04/22",
  called:          "—",
  firstOpened:     "04/12",
  totalOpens:      6,
  firstCalled:     "—",
  totalCommsCount: 4,
  totalCalls:      1,
  totalTexts:      1,
  totalEmails:     2,

  pct:        "15%",
  status:     "Outreach Sent",
  statusType: "init",
  source:     "MLS — Active",
  negotiator: "Josh Santos",
  assigned:   "Josh Santos",

  // Agent deal track record (ISC · Active Nyr · A/P/B/S)
  isc:          19,
  activeYears:  "2yr",
  trackActive:  7,
  trackPending: 3,
  trackBackup:  0,
  trackSold:    54,
  trackTotal:   57,
};

export default function App() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto border border-gray-200 rounded-lg">
        <DealCard property={property} detail={detail} />
      </div>
    </div>
  );
}
```

Run `npm run dev` and you should see the row exactly as in the screenshot.

---

## 4. How each tooltip is wired (so you can extend it)

Every hover element uses the same Tailwind pattern:

```tsx
<span className="relative group cursor-help">
  <span>visible label</span>
  <TipPanel title="…" rows={[["Key", "Value"], …]} />
</span>
```

`TipPanel` is positioned absolutely above its parent (`bottom-full`)
and reveals on `group-hover`. Pass `align="right"` for right-edge
elements (the offer-status chip uses this so the panel doesn't fall
off-screen). Pass `wide` for tooltips with comments / long text.

The tooltip content sources:

| Row | Hover target                         | Tooltip title           | Data                                                                                  |
|-----|--------------------------------------|-------------------------|---------------------------------------------------------------------------------------|
| 1   | Pulsing call CTA (📞)                | native `title` only     | "Call this agent first" / "Call logged"                                               |
| 1   | **Pain label `MID`** (after phone, before CTA) | `Seller Pain` | colored uppercase chip: high red / mid amber / low gray; `painSig` rows in tooltip   |
| 1   | Next-step orange text                | `Next Step`             | `taskWho` / `taskWhat` / `taskHow` / `taskNote`                                        |
| 1   | Channel chips after the response (call/text/mail) | native `title` | `Call: Positive`, `Text: Negative`, `Email: Neutral` from `callResponse` etc.        |
| 1   | Inline flag `Critical` / `Reminder`  | none — plain word       | rendered when `notifications` includes `"critical"` (red) or `"reminder"` (blue)       |
| 2 (property) | Address                       | `Property`              | `prop` rows                                                                            |
| 2 (property) | Sales-type code (e.g. `STD`)  | `Sales Type`            | code + full label, property type                                                       |
| 2 (property) | `● Keywords: Mid` (next to STD) | `Listing Remarks`     | `pubCmt` + `agtCmt` with red `<span class="kw">…</span>` pills                         |
| 2 (property) | `Source: MLS — Active`        | `Source`                | source / status / negotiator / assigned                                                |
| 3 (deal)     | `525k` (semibold, gray-900, no `$`) | `Price History`   | `priceHist` + `priceTotal`. Rendered via `compactPrice(property.price)` — drops `$`, collapses zeros to `k` / `m` |
| 3 (deal)     | `77% ARV`                     | `ARV`                   | asking vs ARV                                                                          |
| 3 (deal)     | `● Pain: Mid` (after ARV)     | `Seller Pain`           | dot color from `PAIN_DOT[detail.pain]`, label from `detail.painLabel`, tooltip rows from `detail.painSig`. Mirrors the Row 1 chip — Row 1 is the at-a-glance signal, this is the inline data label. |
| 3 (deal)     | `● Agent: Not Responsive`     | `Last Attempts`         | `agentComms` (last 5) + `agentRate`                                                    |
| 3 (deal)     | `ISC: 19`                     | `Investor Sourced Count` | `isc` + plain-English meaning ("Number of deals this agent has sourced to investors.") |
| 3 (deal)     | `7A/3P/0B/54S`                | `Deal Track Record`     | `trackActive`, `trackPending`, `trackBackup`, `trackSold`, `trackTotal` (Active Nyr intentionally omitted — tenure isn't actionable) |
| Right | `15% Outreach Sent ▾`              | `Offer Status` (right-aligned) | completion / stage / source / negotiator / assigned                            |
| Right | `Opened 04/22` (plain colored text — green / yellow / red) | `Open History` (right-aligned) | first / last / total opens. Color via `gradeFreshness(detail.opened)` — green ≤3d, yellow 4–7d, red >7d / `—`. **No pill, no box.** |
| Right | `Called —` (plain colored text — green / yellow / red)     | `Communication History` (right-aligned) | first / last + per-channel calls/texts/emails. Same `gradeFreshness()` rule on `detail.called`. **No pill, no box.** |
| Kebab (⋮) | (click to open)                | drill menu              | 3 cols: Communication / Quick Links / Detailed Analysis + footer "Auto Tracker"        |
| 💬 chat icon                          | inline tooltip          | "View conversations"                                                                   |

---

## 5. Sentiment dot palette (channel chips, pain, agent, keywords)

| Status     | Color      |
|------------|------------|
| Positive / Responsive / High keywords | `#639922` (green) |
| Mid pain / Mid keywords               | `#BA7517` (amber) |
| Neutral / Low / None                  | `#B4B2A9` (gray)  |
| Negative / Not responsive / High pain / `Critical` flag | `#E24B4A` (red) |
| `Reminder` flag                       | `#2F86D6` (blue)  |
| Freshness text — fresh (≤3d)          | `#476B14` (dark green)  |
| Freshness text — stale (4–7d)         | `#8B6210` (dark yellow) |
| Freshness text — cold (>7d, `—`, `N/A`) | `#A33232` (dark red)  |

To add more sentiment dots, just push to the `channels` array inside
`ChannelChips` or extend the `*_DOT` maps. To add new inline flag
words, extend `NotificationKind` and add another conditional `<span>`
on Row 1 with the desired color.

---

## 6. Wiring notes

- The pulsing call button uses `animate-pulse` plus a triple
  ring/glow via `ring-2 ring-orange-300 shadow-[0_0_0_3px_rgba(251,146,60,0.35)]`.
  Once `done = true` the pulse is replaced by a checkmark and the row
  goes to 60% opacity.
- Clicking the call button (or "Call" inside the kebab drill menu)
  triggers an inline orange "Call logged. Send text + email follow-up?"
  nudge underneath the row.
- The kebab menu closes on outside click via the `useEffect` listener
  on `document`.

That's it — everything you need is in the single `DealCard.tsx`.
