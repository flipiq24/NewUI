import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MyStats from "@/pages/MyStats";
import AdaptationReports from "@/pages/AdaptationReports";
import IqTasks from "@/pages/iq/IqTasks";
import IqDealReview from "@/pages/iq/IqDealReview";
import IqPropertyDetail from "@/pages/iq/IqPropertyDetail";
import IqDailyOutreach from "@/pages/iq/IqDailyOutreach";
import IqCampaignResponses from "@/pages/iq/IqCampaignResponses";
import IqPriorityAgents from "@/pages/iq/IqPriorityAgents";
import IqNewRelationships from "@/pages/iq/IqNewRelationships";
import IqWelcomeBack from "@/pages/iq/IqWelcomeBack";
import IqInbox from "@/pages/iq/IqInbox";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={MyStats} />
      <Route path="/adaptation-reports" component={AdaptationReports} />
      <Route path="/iq" component={IqTasks} />
      <Route path="/iq/tasks" component={IqTasks} />
      <Route path="/iq/deal-review" component={IqDealReview} />
      <Route path="/iq/deal-review/:address" component={IqPropertyDetail} />
      <Route path="/iq/daily-outreach" component={IqDailyOutreach} />
      <Route path="/iq/campaign-responses" component={IqCampaignResponses} />
      <Route path="/iq/priority-agents" component={IqPriorityAgents} />
      <Route path="/iq/new-relationships" component={IqNewRelationships} />
      <Route path="/iq/welcome-back" component={IqWelcomeBack} />
      <Route path="/iq/inbox" component={IqInbox} />
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
