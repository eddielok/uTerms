import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const AccessibilityPreview: React.FC = () => (
  <PreviewPage
    table="accessibility_statement"
    backPath="/accessibility-statement"
    basePath="/accessibility-statement"
    policyLabel="Accessibility Statement"
    embedDivId="uterms-accessibility"
    embedDivLabel="the Accessibility Statement"
    embedScriptFile="uterms-accessibility-embed.js"
    testPage="test-accessibility.html"
  />
);
