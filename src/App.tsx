import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CookieBanner } from './components/CookieBanner';
import { Layout } from './components/Layout';
import { SidebarLayout } from './components/SidebarLayout';
import { CookieContextProvider } from './context/CookieContext';
import { About } from './pages/About';
import { Checklist } from './pages/Checklist';
import { ConsentManagement } from './pages/ConsentManagement';
import { CookieBannerSettings } from './pages/CookieBannerSettings';
import { CookieLog } from './pages/CookieLog';
import { Dashboard } from './pages/Dashboard';
import { Features } from './pages/Features';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Policies } from './pages/Policies';
import { PolicyManagement } from './pages/PolicyManagement';
import { Register } from './pages/Register';
import { Settings } from './pages/Settings';
import { WebsiteCookie } from './pages/WebsiteCookie';

function App() {
  return (
    <CookieContextProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="policies" element={<Policies />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
        </Route>

        {/* Authenticated Routes with Sidebar */}
        <Route element={<SidebarLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="consent-management" element={<ConsentManagement />} />
          <Route path="consent-management/cookies" element={<Checklist />} />
          <Route path="consent-management/scanner" element={<WebsiteCookie />} />
          <Route path="consent-management/banner-settings" element={<CookieBannerSettings />} />
          <Route path="consent-management/logs" element={<CookieLog />} />
          <Route path="policy-management" element={<PolicyManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect anything else to home for now */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CookieBanner />
      </BrowserRouter>
    </CookieContextProvider>
  );
}

export default App;
