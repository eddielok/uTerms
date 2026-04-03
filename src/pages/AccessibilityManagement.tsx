import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const AccessibilityManagement: React.FC = () => (
  <ManagementPage
    table="accessibility_statement"
    title="Accessibility Statement"
    description="Generate and manage your Accessibility Statements using our step-by-step wizard."
    basePath="/accessibility-statement"
    emptyText="No Accessibility Statements yet."
    emptySubText="Use our step-by-step wizard to create your Accessibility Statement."
    createLabel="Create Statement"
    deleteConfirm="Delete this Accessibility Statement? This cannot be undone."
  />
);
