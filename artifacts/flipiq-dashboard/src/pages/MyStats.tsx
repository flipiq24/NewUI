import Sidebar from "@/components/Sidebar";
import StatsHeader from "@/components/StatsHeader";
import TeamLeaderboard from "@/components/TeamLeaderboard";
import DealPipeline from "@/components/DealPipeline";
import AgentOutreach from "@/components/AgentOutreach";
import PerformanceReport from "@/components/PerformanceReport";
import CoachChat from "@/components/CoachChat";

export default function MyStats() {
  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StatsHeader />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <TeamLeaderboard />
            <div className="grid grid-cols-2 gap-6">
              <DealPipeline />
              <AgentOutreach />
            </div>
            <PerformanceReport />
            <CoachChat />
          </div>
        </div>
      </div>
    </div>
  );
}
