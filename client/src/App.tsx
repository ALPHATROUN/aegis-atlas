import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import MissionControl from "@/pages/MissionControl";
import OlympusActivationWorkbench from "@/pages/OlympusActivationWorkbench";
import { atlasActivationRoute, atlasWorkspaceRoutes } from "@/lib/atlasRoutes";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch><Route path={atlasActivationRoute} component={OlympusActivationWorkbench}/>{atlasWorkspaceRoutes.map((path) => <Route key={path} path={path} component={MissionControl} />)}<Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
