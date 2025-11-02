import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@radix-ui/themes/styles.css";

import { AppProviders } from "./providers/app-providers";
import "./styles/tailwind.css";
import "./styles/animations.css";
import { initAnalytics } from "./lib/analytics";
import { createAppRouter } from "./routes/router";

const router = createAppRouter();

initAnalytics();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
