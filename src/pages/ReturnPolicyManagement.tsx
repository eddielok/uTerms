import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const ReturnPolicyManagement: React.FC = () => (
  <ManagementPage
    table="return_policy"
    title="Return Policy"
    description="Generate and manage your Return Policies using our step-by-step wizard."
    basePath="/return-policy"
    emptyText="No Return Policies yet."
    emptySubText="Use our step-by-step wizard to create your first Return Policy."
    createLabel="Create Return Policy"
    deleteConfirm="Delete this Return Policy? This cannot be undone."
  />
);
