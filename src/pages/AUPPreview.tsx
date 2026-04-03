import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const AUPPreview: React.FC = () => (
  <PreviewPage
    table="acceptable_use_policy"
    backPath="/acceptable-use-policy"
    basePath="/acceptable-use-policy"
    policyLabel="Acceptable Use Policy"
    embedDivId="uterms-aup"
    embedDivLabel="the Acceptable Use Policy"
    embedScriptFile="uterms-aup-embed.js"
    testPage="test-aup.html"
  />
);
