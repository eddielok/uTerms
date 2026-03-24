import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-surface border border-border rounded-lg p-6">
        <p className="text-muted">Configure workspace settings, roles, and integrations.</p>
      </div>
    </div>
  );
};
