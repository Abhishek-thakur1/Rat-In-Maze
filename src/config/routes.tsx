import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const Home = lazy(() => import("@/pages/Home"));
const DFS = lazy(() => import("@/pages/Dfs"));

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/dfs",
    element: <DFS />,
  },
];