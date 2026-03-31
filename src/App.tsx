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
import { CookiePolicyManagement } from "./pages/CookiePolicyManagement";
import { CookiePolicyPreview } from "./pages/CookiePolicyPreview";
import { CookiePolicyWizard } from "./pages/CookiePolicyWizard";
import { PolicyManagement } from "./pages/PolicyManagement";
import { TermsManagement } from "./pages/TermsManagement";
import { TermsPreview } from "./pages/TermsPreview";
import { TermsWizard } from "./pages/TermsWizard";
import { EULAManagement } from "./pages/EULAManagement";
import { EULAPreview } from "./pages/EULAPreview";
import { EULAWizard } from "./pages/EULAWizard";
import { ReturnPolicyManagement } from "./pages/ReturnPolicyManagement";
import { ReturnPolicyPreview } from "./pages/ReturnPolicyPreview";
import { ReturnPolicyWizard } from "./pages/ReturnPolicyWizard";
import { DisclaimerManagement } from "./pages/DisclaimerManagement";
import { DisclaimerPreview } from "./pages/DisclaimerPreview";
import { DisclaimerWizard } from "./pages/DisclaimerWizard";
import { PolicyPreview } from "./pages/PolicyPreview";
import { PrivacyPolicyWizard } from "./pages/PrivacyPolicyWizard";
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
            <Route path="policy-management/new" element={<PrivacyPolicyWizard />} />
            <Route path="policy-management/:id/edit" element={<PrivacyPolicyWizard />} />
            <Route path="policy-management/:id/preview" element={<PolicyPreview />} />
            <Route path="cookie-policy" element={<CookiePolicyManagement />} />
            <Route path="cookie-policy/new" element={<CookiePolicyWizard />} />
            <Route path="cookie-policy/:id/edit" element={<CookiePolicyWizard />} />
            <Route path="cookie-policy/:id/preview" element={<CookiePolicyPreview />} />
            <Route path="terms-of-service" element={<TermsManagement />} />
            <Route path="terms-of-service/new" element={<TermsWizard />} />
            <Route path="terms-of-service/:id/edit" element={<TermsWizard />} />
            <Route path="terms-of-service/:id/preview" element={<TermsPreview />} />
            <Route path="eula" element={<EULAManagement />} />
            <Route path="eula/new" element={<EULAWizard />} />
            <Route path="eula/:id/edit" element={<EULAWizard />} />
            <Route path="eula/:id/preview" element={<EULAPreview />} />
            <Route path="return-policy" element={<ReturnPolicyManagement />} />
            <Route path="return-policy/new" element={<ReturnPolicyWizard />} />
            <Route path="return-policy/:id/edit" element={<ReturnPolicyWizard />} />
            <Route path="return-policy/:id/preview" element={<ReturnPolicyPreview />} />
            <Route path="disclaimer" element={<DisclaimerManagement />} />
            <Route path="disclaimer/new" element={<DisclaimerWizard />} />
            <Route path="disclaimer/:id/edit" element={<DisclaimerWizard />} />
            <Route path="disclaimer/:id/preview" element={<DisclaimerPreview />} />
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
