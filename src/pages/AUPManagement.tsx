import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const AUPManagement: React.FC = () => (
  <ManagementPage
    table="acceptable_use_policy"
    title="Acceptable Use Policy"
    description="Generate and manage your Acceptable Use Policies using our step-by-step wizard."
    basePath="/acceptable-use-policy"
    emptyText="No Acceptable Use Policy yet."
    emptySubText="Use our step-by-step wizard to create your first Acceptable Use Policy."
    createLabel="Create Acceptable Use Policy"
    deleteConfirm="Delete this Acceptable Use Policy? This cannot be undone."
  />
);
