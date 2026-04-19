import React, { forwardRef, useId } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const autoId = useId();
    const generatedId = id || `input-${autoId}`;

    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label htmlFor={generatedId} className="input-label">
            {label}
          </label>
        )}
        <input
          id={generatedId}
          ref={ref}
          className={`input-base ${error ? 'input-error' : ''}`}
          {...props}
        />
        {error && <span className="input-error-msg">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
