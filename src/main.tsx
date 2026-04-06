import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { CookieContextProvider } from "./context/CookieContext.tsx";
import "./index.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <CookieContextProvider>
        <App />
      </CookieContextProvider>
    </HelmetProvider>
  </StrictMode>,
);
