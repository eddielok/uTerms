import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const PolicyPreview: React.FC = () => (
  <PreviewPage
    table="privacy_policies"
    backPath="/policy-management"
    basePath="/policy-management"
    policyLabel="privacy policy"
    embedDivId="uterms-policy"
    embedDivLabel="the policy"
    embedScriptFile="uterms-policy-embed.js"
    testPage="test-policy.html"
  />
);
