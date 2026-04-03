import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const EULAPreview: React.FC = () => (
  <PreviewPage
    table="eula"
    backPath="/eula"
    basePath="/eula"
    policyLabel="EULA"
    embedDivId="uterms-eula"
    embedDivLabel="the EULA"
    embedScriptFile="uterms-eula-embed.js"
    testPage="test-eula.html"
  />
);
