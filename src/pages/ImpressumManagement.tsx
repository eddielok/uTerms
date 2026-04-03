import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const ImpressumManagement: React.FC = () => (
  <ManagementPage
    table="impressum"
    title="Impressum"
    description="Generate and manage your Impressum (Legal Notice) using our step-by-step wizard."
    basePath="/impressum"
    emptyText="No Impressum yet."
    emptySubText="Use our step-by-step wizard to create your Impressum (Legal Notice)."
    createLabel="Create Impressum"
    deleteConfirm="Delete this Impressum? This cannot be undone."
  />
);
