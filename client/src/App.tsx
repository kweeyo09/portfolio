import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const UIDesign = lazy(() => import("./pages/UIDesign"));
const ThreeDMotion = lazy(() => import("./pages/ThreeDMotion"));
const GraphicCampaign = lazy(() => import("./pages/GraphicCampaign"));
const GraphicCampaignProject = lazy(() => import("./pages/GraphicCampaignProject"));
const BudgetApp = lazy(() => import("./pages/BudgetApp"));
const RedBullProject = lazy(() => import("./pages/RedBullProject"));
const KeyboardProject = lazy(() => import("./pages/KeyboardProject"));
const JellyFlowerProject = lazy(() => import("./pages/JellyFlowerProject"));
const Limelight = lazy(() => import("./pages/Limelight"));
const FocusNest = lazy(() => import("./pages/FocusNest"));
const CCNLondon = lazy(() => import("./pages/CCNLondon"));
const ArmaniProject = lazy(() => import("./pages/ArmaniProject"));


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/flowers"} component={Home} />
      <Route path={"/ui-design"} component={UIDesign} />
      <Route path={"/3d-motion"} component={ThreeDMotion} />
      <Route path={"/graphic-campaign"} component={GraphicCampaign} />
      <Route path={"/graphic-campaign/:slug"} component={GraphicCampaignProject} />
      {/* Product design was merged into 3D & Motion; keep old links working */}
      <Route path={"/product-design"}><Redirect to="/3d-motion" replace /></Route>
      <Route path={"/budget-app"} component={BudgetApp} />
      <Route path={"/limelight"} component={Limelight} />
      <Route path={"/focusnest"} component={FocusNest} />
      <Route path={"/ccn-london"} component={CCNLondon} />
      <Route path={"/product-design/redbull"} component={RedBullProject} />
      <Route path={"/product-design/keyboard"} component={KeyboardProject} />
      <Route path={"/product-design/armani"} component={ArmaniProject} />
      <Route path={"/3d-motion/jellyflower"} component={JellyFlowerProject} />
      <Route path={"/3d-motion/people-running"}><Redirect to="/3d-motion" replace /></Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
