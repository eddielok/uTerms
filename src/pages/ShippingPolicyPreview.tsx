import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const ShippingPolicyPreview: React.FC = () => (
  <PreviewPage
    table="shipping_policy"
    backPath="/shipping-policy"
    basePath="/shipping-policy"
    policyLabel="Shipping Policy"
    embedDivId="uterms-shipping-policy"
    embedDivLabel="the Shipping Policy"
    embedScriptFile="uterms-shipping-embed.js"
    testPage="test-shipping.html"
  />
);
