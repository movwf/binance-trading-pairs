import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";

import MarketProvider from "./contexts/MarketContext.jsx";

import Layout from "./layout/index.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          loader: () => {
            if (window.location.pathname === "/") {
              return redirect("/dashboard");
            }
          },
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/dashboard",
          element: (
            <MarketProvider>
              <Dashboard />
            </MarketProvider>
          ),
        },
      ],
    },
  ],
  { basename: import.meta.env.DEV ? "/" : "/app" }
);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
