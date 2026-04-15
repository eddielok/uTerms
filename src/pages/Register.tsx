import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { supabase } from '../lib/supabase';
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
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Error signing up with Google:", err.message);
      alert(err.message);
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

          {errorMsg && <div className="text-red-500 text-sm mb-4">{errorMsg}</div>}
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
            <Button variant="secondary" fullWidth className="flex justify-center gap-2" onClick={handleGoogleSignUp} type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </Button>
          </div>

          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
