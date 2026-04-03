import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const EULAManagement: React.FC = () => (
  <ManagementPage
    table="eula"
    title="EULA"
    description="Generate and manage your End User License Agreements using our step-by-step wizard."
    basePath="/eula"
    emptyText="No EULAs yet."
    emptySubText="Use our step-by-step wizard to create your first EULA."
    createLabel="Create EULA"
    deleteConfirm="Delete this EULA? This cannot be undone."
  />
);
