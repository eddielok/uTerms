import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const ImpressumPreview: React.FC = () => (
  <PreviewPage
    table="impressum"
    backPath="/impressum"
    basePath="/impressum"
    policyLabel="Impressum"
    embedDivId="uterms-impressum"
    embedDivLabel="the Impressum"
    embedScriptFile="uterms-impressum-embed.js"
    testPage="test-impressum.html"
  />
);
