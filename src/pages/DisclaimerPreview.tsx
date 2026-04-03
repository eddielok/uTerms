import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const DisclaimerPreview: React.FC = () => (
  <PreviewPage
    table="disclaimer"
    backPath="/disclaimer"
    basePath="/disclaimer"
    policyLabel="Disclaimer"
    embedDivId="uterms-disclaimer"
    embedDivLabel="the Disclaimer"
    embedScriptFile="uterms-disclaimer-embed.js"
    testPage="test-disclaimer.html"
  />
);
