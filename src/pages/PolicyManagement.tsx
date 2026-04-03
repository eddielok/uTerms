import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const PolicyManagement: React.FC = () => (
  <ManagementPage
    table="privacy_policies"
    title="Privacy Policy"
    description="Generate and manage your privacy policies using our step-by-step wizard."
    basePath="/policy-management"
    emptyText="No policies yet."
    emptySubText="Use our step-by-step wizard to create your first privacy policy."
    createLabel="Create New Policy"
    deleteConfirm="Delete this policy? This cannot be undone."
  />
);
