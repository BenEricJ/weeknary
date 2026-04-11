import { createBrowserRouter, redirect } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AppLayout } from "./layouts/AppLayout";
import { OnboardingView } from "./views/OnboardingView";
import { HomeView } from "./views/HomeView";
import { ProfileView } from "./views/ProfileView";
import { CreateHubView } from "./views/CreateHubView";
import { TrainingView } from "./views/TrainingView";
import { WeekView } from "./views/WeekView";
import { NutritionView } from "./views/NutritionView";
import { SleepView } from "./views/SleepView";
import { ReviewView } from "./views/ReviewView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: OnboardingView },
      {
        path: "app",
        Component: AppLayout,
        children: [
          { path: "home", Component: HomeView },
          { path: "week", Component: WeekView },
          { path: "nutrition", Component: NutritionView },
          { path: "training", Component: TrainingView },
          { path: "sleep", Component: SleepView },
          { path: "review", Component: ReviewView },
          { path: "create", Component: CreateHubView },
          { path: "profile", Component: ProfileView },
        ],
      },
      { path: "*", loader: () => redirect("/") },
    ],
  },
]);
