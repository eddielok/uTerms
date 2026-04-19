import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Parse hash fragment from URL (Supabase puts params here)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');

    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsError(true);
      if (errorCode === 'otp_expired') {
        setMessage('This verification link has expired. Please go to Settings and request a new one.');
      } else {
        setMessage(errorDescription?.replace(/\+/g, ' ') || 'Verification failed. Please try again.');
      }
      return;
    }

    // Let the Supabase client pick up the session from the hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => navigate('/settings'), 2000);
      } else {
        // Try to exchange the token if present
        const accessToken = params.get('access_token');
        if (accessToken) {
          setMessage('Email verified successfully! Redirecting...');
          setTimeout(() => navigate('/settings'), 2000);
        } else {
          setMessage('Verification complete. Redirecting...');
          setTimeout(() => navigate('/settings'), 2000);
        }
      }
    });
  }, [navigate]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center',
    }}>
      {isError ? (
        <>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#dc2626' }}>
            Verification Failed
          </h2>
          <p style={{ color: '#6b7280', maxWidth: '420px', marginBottom: '1.5rem' }}>
            {message}
          </p>
          <button
            onClick={() => navigate('/settings')}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none',
              background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Back to Settings
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {message}
          </h2>
        </>
      )}
    </div>
  );
};
