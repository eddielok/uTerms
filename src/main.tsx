import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CookieContextProvider } from "./context/CookieContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookieContextProvider>
      <App />
    </CookieContextProvider>
  </StrictMode>,
);
