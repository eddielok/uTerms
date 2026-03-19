import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CookieBanner } from './components/CookieBanner';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Policies } from './pages/Policies';
import { Register } from './pages/Register';
import { About } from './pages/About';
import { Features } from './pages/Features';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="policies" element={<Policies />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
          {/* Redirect anything else to home for now */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

export default App;
