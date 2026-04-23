import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MyStats from "@/pages/MyStats";
import AdaptationReports from "@/pages/AdaptationReports";
import IqTasks from "@/pages/iq/IqTasks";
import IqDealReview from "@/pages/iq/IqDealReview";
import IqDailyOutreach from "@/pages/iq/IqDailyOutreach";
import IqPriorityAgents from "@/pages/iq/IqPriorityAgents";
import IqNewRelationships from "@/pages/iq/IqNewRelationships";
import IqWelcomeBack from "@/pages/iq/IqWelcomeBack";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={MyStats} />
      <Route path="/adaptation-reports" component={AdaptationReports} />
      <Route path="/iq" component={IqTasks} />
      <Route path="/iq/tasks" component={IqTasks} />
      <Route path="/iq/deal-review" component={IqDealReview} />
      <Route path="/iq/deal-review/:address" component={() => (
        <div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-700 mb-2">Property detail</h2>
            <p className="text-gray-400 text-sm">Not yet built</p>
          </div>
        </div>
      )} />
      <Route path="/iq/daily-outreach" component={IqDailyOutreach} />
      <Route path="/iq/priority-agents" component={IqPriorityAgents} />
      <Route path="/iq/new-relationships" component={IqNewRelationships} />
      <Route path="/iq/welcome-back" component={IqWelcomeBack} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
