import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const CookiePolicyManagement: React.FC = () => (
  <ManagementPage
    table="cookie_policies"
    title="Cookie Policy"
    description="Generate and manage your Cookie Policies using our step-by-step wizard."
    basePath="/cookie-policy"
    emptyText="No Cookie Policies yet."
    emptySubText="Use our step-by-step wizard to create your first Cookie Policy."
    createLabel="Create Cookie Policy"
    deleteConfirm="Delete this Cookie Policy? This cannot be undone."
  />
);
