import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const DisclaimerManagement: React.FC = () => (
  <ManagementPage
    table="disclaimer"
    title="Disclaimer"
    description="Generate and manage your Disclaimers using our step-by-step wizard."
    basePath="/disclaimer"
    emptyText="No Disclaimers yet."
    emptySubText="Use our step-by-step wizard to create your first Disclaimer."
    createLabel="Create Disclaimer"
    deleteConfirm="Delete this Disclaimer? This cannot be undone."
  />
);
