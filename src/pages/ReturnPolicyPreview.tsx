import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const ReturnPolicyPreview: React.FC = () => (
  <PreviewPage
    table="return_policy"
    backPath="/return-policy"
    basePath="/return-policy"
    policyLabel="Return Policy"
    embedDivId="uterms-return-policy"
    embedDivLabel="the Return Policy"
    embedScriptFile="uterms-return-policy-embed.js"
    testPage="test-return-policy.html"
  />
);
