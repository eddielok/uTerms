import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CookieBanner } from "./components/CookieBanner";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { SidebarLayout } from "./components/SidebarLayout";
import { About } from "./pages/About";
import { Checklist } from "./pages/Checklist";
import { ConsentManagement } from "./pages/ConsentManagement";
import { CookieBannerSettings } from "./pages/CookieBannerSettings";
import { CookieLog } from "./pages/CookieLog";
import { Dashboard } from "./pages/Dashboard";
import { Features } from "./pages/Features";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Policies } from "./pages/Policies";
import { PolicyManagement } from "./pages/PolicyManagement";
import { Register } from "./pages/Register";
import { Settings } from "./pages/Settings";
import { WebsiteCookie } from "./pages/WebsiteCookie";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          {/* Public Access Only (Redirects to Dashboard if logged in) */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          <Route path="policies" element={<Policies />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
        </Route>

        {/* Authenticated Routes with Sidebar (Redirects to Login if NOT logged in) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<SidebarLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="consent-management" element={<ConsentManagement />} />
            <Route path="consent-management/cookies" element={<Checklist />} />
            <Route
              path="consent-management/scanner"
              element={<WebsiteCookie />}
            />
            <Route
              path="consent-management/banner-settings"
              element={<CookieBannerSettings />}
            />
            <Route path="consent-management/logs" element={<CookieLog />} />
            <Route path="policy-management" element={<PolicyManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Redirect anything else to home for now */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
