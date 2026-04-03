import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const TermsManagement: React.FC = () => (
  <ManagementPage
    table="terms_of_service"
    title="Terms of Service"
    description="Generate and manage your Terms of Service using our step-by-step wizard."
    basePath="/terms-of-service"
    emptyText="No Terms of Service yet."
    emptySubText="Use our step-by-step wizard to create your first Terms of Service."
    createLabel="Create New Terms"
    deleteConfirm="Delete this Terms of Service? This cannot be undone."
  />
);
