import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg-main)',
    padding: '2rem',
    textAlign: 'center',
  }}>
    <div style={{
      fontSize: '5rem',
      fontWeight: 800,
      color: 'var(--color-primary)',
      lineHeight: 1,
      letterSpacing: '-0.04em',
      fontFamily: 'var(--font-family)',
    }}>
      404
    </div>
    <h1 style={{
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'var(--color-text-main)',
      margin: '1rem 0 0.5rem',
    }}>
      Page not found
    </h1>
    <p style={{
      fontSize: '0.9375rem',
      color: 'var(--color-text-muted)',
      marginBottom: '2rem',
      maxWidth: '340px',
    }}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5625rem 1.25rem',
        background: 'var(--color-primary)',
        color: '#fff',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        fontSize: '0.875rem',
        textDecoration: 'none',
        transition: 'background 150ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
    >
      <ArrowLeft size={16} />
      Back to home
    </Link>
  </div>
);
