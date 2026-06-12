import { createBrowserRouter, redirect } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AppLayout } from "./layouts/AppLayout";

const onboardingRoute = () =>
  import("./views/OnboardingView").then(({ OnboardingView }) => ({
    Component: OnboardingView,
  }));
const homeRoute = () =>
  import("./views/HomeView").then(({ HomeView }) => ({ Component: HomeView }));
const nutritionRoute = () =>
  import("./views/NutritionView").then(({ NutritionView }) => ({
    Component: NutritionView,
  }));
const trainingRoute = () =>
  import("./views/TrainingView").then(({ TrainingView }) => ({
    Component: TrainingView,
  }));
const sleepRoute = () =>
  import("./views/SleepView").then(({ SleepView }) => ({ Component: SleepView }));
const reviewRoute = () =>
  import("./views/ReviewView").then(({ ReviewView }) => ({
    Component: ReviewView,
  }));
const createHubRoute = () =>
  import("./views/CreateHubView").then(({ CreateHubView }) => ({
    Component: CreateHubView,
  }));
const profileRoute = () =>
  import("./views/ProfileView").then(({ ProfileView }) => ({
    Component: ProfileView,
  }));

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, lazy: onboardingRoute },
      {
        path: "app",
        Component: AppLayout,
        children: [
          { index: true, loader: () => redirect("home") },
          { path: "home", lazy: homeRoute },
          { path: "plan", lazy: homeRoute },
          { path: "week", lazy: homeRoute },
          { path: "nutrition", lazy: nutritionRoute },
          { path: "training", lazy: trainingRoute },
          { path: "sleep", lazy: sleepRoute },
          { path: "review", lazy: reviewRoute },
          { path: "create", lazy: createHubRoute },
          { path: "profile", lazy: profileRoute },
        ],
      },
      { path: "*", loader: () => redirect("/") },
    ],
  },
], {
  basename: import.meta.env.BASE_URL,
});
