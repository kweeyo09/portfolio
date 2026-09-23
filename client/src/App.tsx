import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Intro from "./pages/Intro";

const Home = lazy(() => import("./pages/Home"));
const UIDesign = lazy(() => import("./pages/UIDesign"));
const ThreeDMotion = lazy(() => import("./pages/ThreeDMotion"));
const ProductDesign = lazy(() => import("./pages/ProductDesign"));
const BudgetApp = lazy(() => import("./pages/BudgetApp"));
const RedBullProject = lazy(() => import("./pages/RedBullProject"));
const KeyboardProject = lazy(() => import("./pages/KeyboardProject"));
const JellyFlowerProject = lazy(() => import("./pages/JellyFlowerProject"));
const Limelight = lazy(() => import("./pages/Limelight"));


function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Intro} />
      <Route path={"/flowers"} component={Home} />
      <Route path={"/ui-design"} component={UIDesign} />
      <Route path={"/3d-motion"} component={ThreeDMotion} />
      <Route path={"/product-design"} component={ProductDesign} />
      <Route path={"/budget-app"} component={BudgetApp} />
      <Route path={"/limelight"} component={Limelight} />
      <Route path={"/product-design/redbull"} component={RedBullProject} />
      <Route path={"/product-design/keyboard"} component={KeyboardProject} />
      <Route path={"/3d-motion/jellyflower"} component={JellyFlowerProject} />
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
          <Suspense fallback={<div style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: "#050505", color: "#f8f5ef", fontFamily: "'Barlow', sans-serif" }}>Loading studio…</div>}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
