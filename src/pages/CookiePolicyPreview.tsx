import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const CookiePolicyPreview: React.FC = () => (
  <PreviewPage
    table="cookie_policies"
    backPath="/cookie-policy"
    basePath="/cookie-policy"
    policyLabel="cookie policy"
    embedDivId="uterms-cookie-policy"
    embedDivLabel="the policy"
    embedScriptFile="uterms-cookie-embed.js"
    testPage="test-cookie-policy.html"
  />
);
