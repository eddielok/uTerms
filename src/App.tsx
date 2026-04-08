import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CookieBanner } from "./components/CookieBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { SidebarLayout } from "./components/SidebarLayout";

// ── Eagerly loaded (tiny, always needed) ─────────────────────────────────────
import { NotFound } from "./pages/NotFound";

// ── Public pages ──────────────────────────────────────────────────────────────
const Home = React.lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const About = React.lazy(() => import("./pages/About").then(m => ({ default: m.About })));
const Features = React.lazy(() => import("./pages/Features").then(m => ({ default: m.Features })));
const Policies = React.lazy(() => import("./pages/Policies").then(m => ({ default: m.Policies })));
const Login = React.lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register = React.lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));
const DoNotSell = React.lazy(() => import("./pages/DoNotSell").then(m => ({ default: m.DoNotSell })));

// ── Dashboard & consent ───────────────────────────────────────────────────────
const Dashboard = React.lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const ConsentManagement = React.lazy(() => import("./pages/ConsentManagement").then(m => ({ default: m.ConsentManagement })));
const Checklist = React.lazy(() => import("./pages/Checklist").then(m => ({ default: m.Checklist })));
const WebsiteCookie = React.lazy(() => import("./pages/WebsiteCookie").then(m => ({ default: m.WebsiteCookie })));
const CookieBannerSettings = React.lazy(() => import("./pages/CookieBannerSettings").then(m => ({ default: m.CookieBannerSettings })));
const CookieLog = React.lazy(() => import("./pages/CookieLog").then(m => ({ default: m.CookieLog })));

// ── Privacy Policy ────────────────────────────────────────────────────────────
const PolicyManagement = React.lazy(() => import("./pages/PolicyManagement").then(m => ({ default: m.PolicyManagement })));
const PrivacyPolicyWizard = React.lazy(() => import("./pages/PrivacyPolicyWizard").then(m => ({ default: m.PrivacyPolicyWizard })));
const PolicyPreview = React.lazy(() => import("./pages/PolicyPreview").then(m => ({ default: m.PolicyPreview })));

// ── Cookie Policy ─────────────────────────────────────────────────────────────
const CookiePolicyManagement = React.lazy(() => import("./pages/CookiePolicyManagement").then(m => ({ default: m.CookiePolicyManagement })));
const CookiePolicyWizard = React.lazy(() => import("./pages/CookiePolicyWizard").then(m => ({ default: m.CookiePolicyWizard })));
const CookiePolicyPreview = React.lazy(() => import("./pages/CookiePolicyPreview").then(m => ({ default: m.CookiePolicyPreview })));

// ── Terms of Service ──────────────────────────────────────────────────────────
const TermsManagement = React.lazy(() => import("./pages/TermsManagement").then(m => ({ default: m.TermsManagement })));
const TermsWizard = React.lazy(() => import("./pages/TermsWizard").then(m => ({ default: m.TermsWizard })));
const TermsPreview = React.lazy(() => import("./pages/TermsPreview").then(m => ({ default: m.TermsPreview })));

// ── EULA ──────────────────────────────────────────────────────────────────────
const EULAManagement = React.lazy(() => import("./pages/EULAManagement").then(m => ({ default: m.EULAManagement })));
const EULAWizard = React.lazy(() => import("./pages/EULAWizard").then(m => ({ default: m.EULAWizard })));
const EULAPreview = React.lazy(() => import("./pages/EULAPreview").then(m => ({ default: m.EULAPreview })));

// ── Return Policy ─────────────────────────────────────────────────────────────
const ReturnPolicyManagement = React.lazy(() => import("./pages/ReturnPolicyManagement").then(m => ({ default: m.ReturnPolicyManagement })));
const ReturnPolicyWizard = React.lazy(() => import("./pages/ReturnPolicyWizard").then(m => ({ default: m.ReturnPolicyWizard })));
const ReturnPolicyPreview = React.lazy(() => import("./pages/ReturnPolicyPreview").then(m => ({ default: m.ReturnPolicyPreview })));

// ── Disclaimer ────────────────────────────────────────────────────────────────
const DisclaimerManagement = React.lazy(() => import("./pages/DisclaimerManagement").then(m => ({ default: m.DisclaimerManagement })));
const DisclaimerWizard = React.lazy(() => import("./pages/DisclaimerWizard").then(m => ({ default: m.DisclaimerWizard })));
const DisclaimerPreview = React.lazy(() => import("./pages/DisclaimerPreview").then(m => ({ default: m.DisclaimerPreview })));

// ── Shipping Policy ───────────────────────────────────────────────────────────
const ShippingPolicyManagement = React.lazy(() => import("./pages/ShippingPolicyManagement").then(m => ({ default: m.ShippingPolicyManagement })));
const ShippingPolicyWizard = React.lazy(() => import("./pages/ShippingPolicyWizard").then(m => ({ default: m.ShippingPolicyWizard })));
const ShippingPolicyPreview = React.lazy(() => import("./pages/ShippingPolicyPreview").then(m => ({ default: m.ShippingPolicyPreview })));

// ── Acceptable Use Policy ─────────────────────────────────────────────────────
const AUPManagement = React.lazy(() => import("./pages/AUPManagement").then(m => ({ default: m.AUPManagement })));
const AUPWizard = React.lazy(() => import("./pages/AUPWizard").then(m => ({ default: m.AUPWizard })));
const AUPPreview = React.lazy(() => import("./pages/AUPPreview").then(m => ({ default: m.AUPPreview })));

// ── Impressum ─────────────────────────────────────────────────────────────────
const ImpressumManagement = React.lazy(() => import("./pages/ImpressumManagement").then(m => ({ default: m.ImpressumManagement })));
const ImpressumWizard = React.lazy(() => import("./pages/ImpressumWizard").then(m => ({ default: m.ImpressumWizard })));
const ImpressumPreview = React.lazy(() => import("./pages/ImpressumPreview").then(m => ({ default: m.ImpressumPreview })));

// ── Accessibility Statement ───────────────────────────────────────────────────
const AccessibilityManagement = React.lazy(() => import("./pages/AccessibilityManagement").then(m => ({ default: m.AccessibilityManagement })));
const AccessibilityWizard = React.lazy(() => import("./pages/AccessibilityWizard").then(m => ({ default: m.AccessibilityWizard })));
const AccessibilityPreview = React.lazy(() => import("./pages/AccessibilityPreview").then(m => ({ default: m.AccessibilityPreview })));

// ── Misc authenticated ────────────────────────────────────────────────────────
const Settings = React.lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const APIDocumentation = React.lazy(() => import("./pages/APIDocumentation").then(m => ({ default: m.APIDocumentation })));

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Suspense fallback={null}>
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
            <Route path="do-not-sell" element={<DoNotSell />} />
          </Route>

          {/* Authenticated Routes with Sidebar (Redirects to Login if NOT logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="consent-management" element={<ConsentManagement />} />
              <Route path="consent-management/cookies" element={<Checklist />} />
              <Route path="consent-management/scanner" element={<WebsiteCookie />} />
              <Route path="consent-management/banner-settings" element={<CookieBannerSettings />} />
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
              <Route path="shipping-policy" element={<ShippingPolicyManagement />} />
              <Route path="shipping-policy/new" element={<ShippingPolicyWizard />} />
              <Route path="shipping-policy/:id/edit" element={<ShippingPolicyWizard />} />
              <Route path="shipping-policy/:id/preview" element={<ShippingPolicyPreview />} />
              <Route path="acceptable-use-policy" element={<AUPManagement />} />
              <Route path="acceptable-use-policy/new" element={<AUPWizard />} />
              <Route path="acceptable-use-policy/:id/edit" element={<AUPWizard />} />
              <Route path="acceptable-use-policy/:id/preview" element={<AUPPreview />} />
              <Route path="impressum" element={<ImpressumManagement />} />
              <Route path="impressum/new" element={<ImpressumWizard />} />
              <Route path="impressum/:id/edit" element={<ImpressumWizard />} />
              <Route path="impressum/:id/preview" element={<ImpressumPreview />} />
              <Route path="accessibility-statement" element={<AccessibilityManagement />} />
              <Route path="accessibility-statement/new" element={<AccessibilityWizard />} />
              <Route path="accessibility-statement/:id/edit" element={<AccessibilityWizard />} />
              <Route path="accessibility-statement/:id/preview" element={<AccessibilityPreview />} />
              <Route path="settings" element={<Settings />} />
              <Route path="api-documentation" element={<APIDocumentation />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
