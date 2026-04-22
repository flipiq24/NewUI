import { Settings, LogOut } from "lucide-react";
import { useLocation, Link } from "wouter";
import { resetIqStateIfNewDay } from "@/lib/iq/storage";

export default function Sidebar() {
  const [location] = useLocation();
  const isIqMode = location.startsWith("/iq");

  if (isIqMode) {
    return <IqSidebar location={location} />;
  }

  return <DefaultSidebar location={location} />;
}

function IqSidebar({ location }: { location: string }) {
  const state = resetIqStateIfNewDay();
  const iqDone = !!state.morningCheckin;
  const dealReviewComplete = state.dealReviewComplete ?? false;
  const outreachSent = state.outreachCampaignSent ?? false;
  const priorityComplete = state.priorityAgentsComplete ?? false;

  const iqActive = location === "/iq" || location === "/iq/tasks" || location === "/iq/welcome-back";

  return (
    <div className="w-[192px] bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      <div className="p-4 pt-5 pb-3">
        <Link href="/iq">
          <FlipIQLogo />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Today's Plan</p>
        <Link href="/iq">
          <IqNavItem
            icon={<LightbulbIcon />}
            label="iQ"
            active={iqActive}
            done={iqDone && !iqActive}
          />
        </Link>
        {dealReviewComplete && (
          <Link href="/iq/deal-review">
            <IqNavItem
              icon={<FileTextIcon />}
              label="Deal Review"
              done
            />
          </Link>
        )}
        {(outreachSent || priorityComplete) && (
          <Link href="/iq/daily-outreach">
            <IqNavItem
              icon={<PhoneIcon />}
              label="Daily Outreach"
              done={priorityComplete}
            />
          </Link>
        )}
      </div>

      <div className="mt-auto px-3 pb-3">
        <Link href="/">
          <IqNavItem icon={<BackIcon />} label="← Back to COMMAND" />
        </Link>
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

function DefaultSidebar({ location }: { location: string }) {
  const myStatsActive = location === "/";
  const reportsActive = location === "/adaptation-reports";

  return (
    <div className="w-[192px] bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      <div className="p-4 pt-5 pb-3">
        <Link href="/iq">
          <FlipIQLogo />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Today's Plan</p>
        <Link href="/iq">
          <NavItem icon={<HomeIcon />} label="iQ" />
        </Link>
        <NavItem icon={<FileTextIcon />} label="Deal Review" badge="0 / 4" />
        <NavItem icon={<PhoneIcon />} label="Daily Outreach" badge="0 / 12" />
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
        <div className="pl-4">
          <NavItem label="Add Property +" icon={null} small />
        </div>
      </div>

      <div className="mt-auto px-3 pb-3">
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

function IqNavItem({ icon, label, badge, active, done }: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${
      active ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
    }`}>
      {icon && <span className={`flex-shrink-0 w-3.5 h-3.5 ${active ? "text-white" : "text-gray-500"}`}>{icon}</span>}
      <span className={`text-xs font-medium flex-1 ${active ? "text-white" : ""}`}>{label}</span>
      {done && !active && (
        <span className="text-green-500 flex-shrink-0">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="2,8 6,12 14,4" />
          </svg>
        </span>
      )}
      {badge && !done && (
        <span className={`text-[10px] font-medium ${active ? "text-orange-100" : "text-gray-400"}`}>
          {badge}
        </span>
      )}
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
      active ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
    } ${small ? "py-1" : ""}`}>
      {icon && <span className={`flex-shrink-0 ${active ? "text-white" : "text-gray-500"} ${small ? "w-3 h-3" : "w-3.5 h-3.5"}`}>{icon}</span>}
      <span className={`${small ? "text-[10px]" : "text-xs"} font-medium flex-1 ${active ? "text-white" : ""}`}>{label}</span>
      {badge && <span className="text-[10px] text-gray-400">{badge}</span>}
    </div>
  );
}

function FlipIQLogo() {
  return (
    <div className="px-1 cursor-pointer">
      <img
        src={`${import.meta.env.BASE_URL}flipiq-logo.png`}
        alt="FlipIQ"
        className="w-[110px] object-contain"
      />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,8 6,12 14,4" />
    </svg>
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
