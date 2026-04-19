import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { supabase } from '../lib/supabase';
import { renderGoogleButton } from '../lib/googleAuth';
import { Alert } from '../components/Alert';
import './Auth.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = googleBtnRef.current;
    if (!el) return;

    const tryRender = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).google) {
        renderGoogleButton(
          el,
          () => navigate('/dashboard'),
          (msg) => setErrorMsg(msg)
        );
      } else {
        setTimeout(tryRender, 200);
      }
    };
    tryRender();
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
          }
        }
      });
      if (error) throw error;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      } else {
        setSuccessMsg('Account created! Check your email to confirm your account before logging in.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Sign Up — Start for Free | uTerms</title>
        <meta name="description" content="Create a free uTerms account. Generate GDPR-compliant policies, configure a cookie consent banner, and manage visitor consent in minutes." />
      </Helmet>
      <div className="auth-bg-decor"></div>

      <Card className="auth-card">
        <CardContent className="p-8">
          <div className="auth-header">
            <h1 className="auth-title">Create an account</h1>
          </div>

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="flex gap-4">
              <Input label="First Name" placeholder="Jane" required value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Input label="Last Name" placeholder="Doe" required value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <Input
              label="Work Email"
              type="email"
              placeholder="jane@company.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              label="Company Name"
              placeholder="Acme Corp"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div className="text-xs text-muted mt-2">
              By creating an account, you agree to our <Link to="/terms-of-service-uterms" className="auth-link">Terms of Service</Link> and <Link to="/privacy-policy" className="auth-link">Privacy Policy</Link>.
            </div>

            <Button type="submit" variant="primary" fullWidth className="mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="oauth-buttons">
            <div ref={googleBtnRef} className="google-btn-container" />
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
