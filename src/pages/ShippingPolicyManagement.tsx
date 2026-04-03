import React from 'react';
import { ManagementPage } from '../components/ManagementPage';

export const ShippingPolicyManagement: React.FC = () => (
  <ManagementPage
    table="shipping_policy"
    title="Shipping Policy"
    description="Generate and manage your Shipping Policies using our step-by-step wizard."
    basePath="/shipping-policy"
    emptyText="No Shipping Policies yet."
    emptySubText="Use our step-by-step wizard to create your first Shipping Policy."
    createLabel="Create Shipping Policy"
    deleteConfirm="Delete this Shipping Policy? This cannot be undone."
  />
);
