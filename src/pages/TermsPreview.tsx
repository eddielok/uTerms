import React from 'react';
import { PreviewPage } from '../components/PreviewPage';

export const TermsPreview: React.FC = () => (
  <PreviewPage
    table="terms_of_service"
    backPath="/terms-of-service"
    basePath="/terms-of-service"
    policyLabel="Terms of Service"
    embedDivId="uterms-tos"
    embedDivLabel="the Terms of Service"
    embedScriptFile="uterms-tos-embed.js"
    testPage="test-tos.html"
  />
);
