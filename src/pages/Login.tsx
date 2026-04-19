import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardContent } from "../components/Card";
import { Input } from "../components/Input";
import { supabase } from "../lib/supabase";
import { renderGoogleButton } from "../lib/googleAuth";
import { Alert } from "../components/Alert";
import "./Auth.css";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = googleBtnRef.current;
    if (!el) return;

    const tryRender = () => {
      if ((window as any).google) {
        renderGoogleButton(
          el,
          () => navigate("/dashboard"),
          (msg) => setErrorMsg(msg)
        );
      } else {
        setTimeout(tryRender, 200);
      }
    };
    tryRender();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Log In | uTerms</title>
        <meta name="description" content="Log in to your uTerms account to manage cookie consent, policies, and compliance." />
      </Helmet>
      <div className="auth-bg-decor"></div>

      <Card className="auth-card">
        <CardContent className="p-8">
          <div className="auth-header">
            <p className="auth-subtitle">Log in to your uTerms account</p>
          </div>

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
          <form className="auth-form" onSubmit={handleLogin}>
            <Input
              label="Work Email"
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="oauth-buttons">
            <div ref={googleBtnRef} className="google-btn-container" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
