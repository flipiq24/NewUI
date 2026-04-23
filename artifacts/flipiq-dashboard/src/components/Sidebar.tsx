import { Settings, LogOut } from "lucide-react";
import { useLocation, Link } from "wouter";
import { resetIqStateIfNewDay, startNewIqDay } from "@/lib/iq/storage";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const isIqMode = location.startsWith("/iq");

  // Prototype helper: clicking the logo wipes today's iQ progress and
  // sends the user back to the Morning Check-in so the full flow can be
  // demoed from scratch.
  function startFresh() {
    startNewIqDay();
    navigate("/iq");
  }

  if (isIqMode) {
    return <IqSidebar location={location} onLogoClick={startFresh} />;
  }

  return <DefaultSidebar location={location} onLogoClick={startFresh} />;
}

function IqSidebar({ location, onLogoClick }: { location: string; onLogoClick: () => void }) {
  const state = resetIqStateIfNewDay();

  const welcomeBackActive = location === "/iq/welcome-back";
  const todaysPlanActive = location === "/iq" || location === "/iq/tasks";
  const activeDealsActive = location === "/iq/deal-review";
  const agentsLocations = ["/iq/daily-outreach", "/iq/campaign-responses", "/iq/priority-agents"];
  const agentsActive = agentsLocations.includes(location);
  const newDealsActive = location === "/iq/new-relationships";

  return (
    <div className="w-[192px] bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      <div className="p-4 pt-5 pb-3">
        <button
          onClick={onLogoClick}
          title="Start a new morning (resets today's progress)"
          className="block w-full text-left cursor-pointer"
        >
          <FlipIQLogo />
        </button>
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">iQ</p>
        <Link href="/iq">
          <IqNavItem
            icon={<LightbulbIcon />}
            label="Today's Plan"
            active={todaysPlanActive}
            done={!!state.morningCheckin && !todaysPlanActive}
          />
        </Link>
        {(activeDealsActive || !!state.dealReviewComplete) && (
          <Link href="/iq/deal-review">
            <IqNavItem
              icon={<FileTextIcon />}
              label="Active Deals"
              active={activeDealsActive}
              done={!!state.dealReviewComplete && !activeDealsActive}
            />
          </Link>
        )}
        {(agentsActive || !!(state.outreachCampaignSent && state.priorityAgentsComplete)) && (
          <Link href="/iq/daily-outreach">
            <IqNavItem
              icon={<PhoneIcon />}
              label="Agents"
              active={agentsActive}
              done={!!(state.outreachCampaignSent && state.priorityAgentsComplete) && !agentsActive}
            />
          </Link>
        )}
        {(newDealsActive || !!state.newRelationshipsComplete) && (
          <Link href="/iq/new-relationships">
            <IqNavItem
              icon={<FolderIcon />}
              label="New Deals"
              active={newDealsActive}
              done={!!state.newRelationshipsComplete && !newDealsActive}
            />
          </Link>
        )}
        {welcomeBackActive && (
          <Link href="/iq/welcome-back">
            <IqNavItem
              icon={<LightbulbIcon />}
              label="Welcome Back"
              active={welcomeBackActive}
              done={false}
            />
          </Link>
        )}
      </div>

      {welcomeBackActive && (
        <div className="px-3 pb-2 mt-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Revenue Pipeline</p>
          <NavItem icon={<FolderIcon />} label="My Deals" />
        </div>
      )}

      <div className="mt-auto px-3 pb-3 space-y-1">
        <button className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800">
          Add Property
          <span className="text-orange-500 font-bold">+</span>
        </button>
        <Link href="/">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer text-gray-600 hover:bg-gray-100">
            <span className="flex-shrink-0 w-3 h-3 text-gray-500"><BackIcon /></span>
            <span className="text-[10px] font-medium whitespace-nowrap">← Back to COMMAND 1.5</span>
          </div>
        </Link>
      </div>

      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-800">Josh Santos</p>
        <p className="text-[10px] text-gray-400">joshs@fair-close.com</p>
        <div className="flex items-center gap-2 mt-1">
          <Settings className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
          <LogOut
            className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-orange-500"
            onClick={onLogoClick}
          />
        </div>
      </div>
    </div>
  );
}

function DefaultSidebar({ location, onLogoClick }: { location: string; onLogoClick: () => void }) {
  const myStatsActive = location === "/";
  const reportsActive = location === "/adaptation-reports";

  return (
    <div className="w-[192px] bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      <div className="p-4 pt-5 pb-3">
        <button
          onClick={onLogoClick}
          title="Start a new morning (resets today's progress)"
          className="block w-full text-left cursor-pointer"
        >
          <FlipIQLogo />
        </button>
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Today's Plan</p>
        <Link href="/iq">
          <NavItem icon={<HomeIcon />} label="iQ" />
        </Link>
        <NavItem icon={<FileTextIcon />} label="Active Deals" badge="0 / 4" />
        <NavItem icon={<PhoneIcon />} label="Agents" badge="0 / 12" />
        <NavItem icon={<FolderIcon />} label="New Deals" badge="0 / 1" />
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Revenue Pipeline</p>
        <NavItem icon={<FolderIcon />} label="My Deals" />
        <NavItem icon={<ChartIcon />} label="Revenue Pipeline" />
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Find Deals</p>
        <NavItem icon={<FlameIcon />} label="MLS Hot Deals" />
        <NavItem icon={<SearchIcon />} label="MLS Search" />
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Insights</p>
        <Link href="/adaptation-reports">
          <NavItem label="Reports" icon={<ReportsIcon />} active={reportsActive} />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Tools</p>
        <Link href="/">
          <NavItem label="My Stats" icon={<BarChartIcon />} active={myStatsActive} />
        </Link>
        <NavItem label="Deal Dashboard" icon={<DashboardIcon />} />
        <NavItem label="DispoPro" icon={<DispoIcon />} />
      </div>

      <div className="mt-auto px-3 pb-3 space-y-1">
        <button className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-800">
          Add Property
          <span className="text-orange-500 font-bold">+</span>
        </button>
        <NavItem icon={<CollapseIcon />} label="Collapse sidebar" />
        <NavItem icon={<LogInIcon />} label="Log in as..." />
      </div>

      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-800">Josh Santos</p>
        <p className="text-[10px] text-gray-400">joshs@fair-close.com</p>
        <div className="flex items-center gap-2 mt-1">
          <Settings className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
          <LogOut className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

function IqNavItem({ icon, label, active, done }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  const showCheck = done && !active;
  const displayIcon = showCheck ? (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,8 6,12 14,4" />
    </svg>
  ) : icon;

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${
      active ? "bg-transparent border border-orange-500 text-gray-600" : "text-gray-600 hover:bg-gray-100"
    }`}>
      <span className={`flex-shrink-0 w-3.5 h-3.5 ${active ? "text-gray-500" : showCheck ? "text-green-600" : "text-gray-500"}`}>{displayIcon}</span>
      <span className={`text-xs font-medium flex-1 ${active ? "text-gray-600" : ""}`}>{label}</span>
    </div>
  );
}

function NavItem({ icon, label, badge, active, small }: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${
      active ? "bg-transparent border border-orange-500 text-gray-600" : "text-gray-600 hover:bg-gray-100"
    } ${small ? "py-1" : ""}`}>
      {icon && <span className={`flex-shrink-0 ${active ? "text-gray-500" : "text-gray-500"} ${small ? "w-3 h-3" : "w-3.5 h-3.5"}`}>{icon}</span>}
      <span className={`${small ? "text-[10px]" : "text-xs"} font-medium flex-1 ${active ? "text-gray-600" : ""}`}>{label}</span>
      {badge && <span className="text-[10px] text-gray-400">{badge}</span>}
    </div>
  );
}

function FlipIQLogo() {
  return (
    <div className="px-1 cursor-pointer flex items-end gap-1.5">
      <img
        src={`${import.meta.env.BASE_URL}flipiq-logo.png`}
        alt="FlipIQ"
        className="w-[110px] object-contain"
      />
      <span className="text-[10px] font-light text-gray-300 leading-none pb-0.5">v2.0</span>
    </div>
  );
}

function LightbulbIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1a4 4 0 00-2 7.46V11a1 1 0 001 1h2a1 1 0 001-1V8.46A4 4 0 008 1zm-1 11.5h2v.5a1 1 0 01-2 0v-.5z" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="10,4 6,8 10,12" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1L1 7h2v7h4v-4h2v4h4V7h2L8 1z" />
    </svg>
  );
}
function FileTextIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="2" width="10" height="12" rx="1" />
      <line x1="5" y1="6" x2="11" y2="6" />
      <line x1="5" y1="9" x2="11" y2="9" />
      <line x1="5" y1="12" x2="8" y2="12" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h3l1.5 3.5-2 1.2C6.3 9 7 9.7 8.3 10.5l1.2-2L13 10v3c0 .6-.5 1-1 1C5.4 14 2 6.6 2 3c0-.5.4-1 1-1z" />
    </svg>
  );
}
function FolderIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4a1 1 0 011-1h3l2 2h5a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="14" x2="14" y2="14" />
      <polyline points="3,10 6,6 9,8 13,3" />
    </svg>
  );
}
function FlameIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5C8 1.5 5 5 5 8.5a3 3 0 006 0C11 6.5 9.5 4 8 1.5z" opacity="0.7" />
      <path d="M8 6C8 6 6.5 8 6.5 9.5a1.5 1.5 0 003 0C9.5 8.5 8.5 7 8 6z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  );
}
function ReportsIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="2,12 6,7 9,9 14,3" />
    </svg>
  );
}
function BarChartIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
      <rect x="2" y="10" width="3" height="4" />
      <rect x="6.5" y="6" width="3" height="8" />
      <rect x="11" y="2" width="3" height="12" />
    </svg>
  );
}
function DashboardIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="5" height="5" rx="0.5" />
      <rect x="9" y="2" width="5" height="5" rx="0.5" />
      <rect x="2" y="9" width="5" height="5" rx="0.5" />
      <rect x="9" y="9" width="5" height="5" rx="0.5" />
    </svg>
  );
}
function DispoIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <line x1="5" y1="7" x2="11" y2="7" />
      <line x1="5" y1="10" x2="8" y2="10" />
    </svg>
  );
}
function CollapseIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="10,4 6,8 10,12" />
    </svg>
  );
}
function LogInIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 2H3a1 1 0 00-1 1v10a1 1 0 001 1h4" />
      <polyline points="10,5 14,8 10,11" />
      <line x1="6" y1="8" x2="14" y2="8" />
    </svg>
  );
}
