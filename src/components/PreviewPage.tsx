import DOMPurify from 'dompurify';
import { ArrowLeft, Check, Code, Copy, Download, Eye, Globe, Pencil } from 'lucide-react';
import React from 'react';
import { API_URL } from '../lib/config';
import { usePreviewPolicy } from '../hooks/usePreviewPolicy';
import '../pages/PolicyPreview.css';

interface PreviewPageProps {
  table: string;
  backPath: string;
  basePath: string;
  policyLabel: string;
  embedDivId: string;
  embedDivLabel: string;
  embedScriptFile: string;
  testPage: string;
}

export const PreviewPage: React.FC<PreviewPageProps> = ({
  table,
  backPath,
  basePath,
  policyLabel,
  embedDivId,
  embedDivLabel,
  embedScriptFile,
  testPage,
}) => {
  const {
    id,
    policy,
    isLoading,
    userId,
    copied,
    embedCopied,
    isToggling,
    navigate,
    handleCopy,
    handleDownload,
    handleTogglePublish,
    handleCopyEmbed,
  } = usePreviewPolicy(table);

  const embedScript = userId
    ? `<!-- Step 1: place this where you want the ${embedDivLabel} to appear -->\n<div id="${embedDivId}"></div>\n\n<!-- Step 2: add this script tag (e.g. before </body>) -->\n<script src="${API_URL}/${embedScriptFile}?id=${userId}"></script>`
    : '';

  if (isLoading) {
    return <div className="preview-loading">Loading policy...</div>;
  }

  if (!policy) {
    return (
      <div className="preview-loading">
        <p>Policy not found.</p>
        <button className="preview-back-btn" onClick={() => navigate(backPath)}>
          <ArrowLeft size={16} /> Back to Policies
        </button>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div className="preview-topbar">
        <button className="preview-back-btn" onClick={() => navigate(backPath)}>
          <ArrowLeft size={16} /> Back to Policies
        </button>

        <div className="preview-actions">
          <span className={`status-badge ${policy.status}`}>
            {policy.status === 'published' ? 'Published' : 'Draft'}
          </span>
          <button className="preview-btn" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="preview-btn" onClick={handleDownload}>
            <Download size={15} /> Download
          </button>
          <button className="preview-btn" onClick={() => navigate(`${basePath}/${id}/edit`)}>
            <Pencil size={15} /> Edit
          </button>
          <button
            className={`preview-btn publish ${policy.status === 'published' ? 'unpublish' : ''}`}
            onClick={handleTogglePublish}
            disabled={isToggling}
          >
            <Globe size={15} />
            {isToggling ? '...' : policy.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="preview-meta">
        <h1>{policy.title}</h1>
        <p className="preview-updated">
          Last updated:{' '}
          {new Date(policy.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <div className="preview-doc-wrapper">
        <div
          className="preview-doc"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(policy.generated || '<p>No content generated.</p>') }}
        />
      </div>

      <div className="embed-section">
        <div className="embed-section-header">
          <Code size={18} />
          <h2>Embed on your website</h2>
        </div>

        {policy.status !== 'published' ? (
          <p className="embed-notice">
            Publish this {policyLabel} first to get the embed snippet.
          </p>
        ) : (
          <>
            <p className="embed-description">
              Paste the snippet below into any page to display your {policyLabel}. Place the{' '}
              <code>&lt;div&gt;</code> where you want it to appear, and the{' '}
              <code>&lt;script&gt;</code> tag before <code>&lt;/body&gt;</code>.
            </p>
            <div className="embed-code-block">
              <pre>{embedScript}</pre>
              <button className="embed-copy-btn" onClick={() => handleCopyEmbed(embedScript)}>
                {embedCopied ? <Check size={14} /> : <Copy size={14} />}
                {embedCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ display: 'flex' }}>
              <button
                className="embed-preview-btn"
                onClick={() => window.open(`${API_URL}/${testPage}?id=${userId}&api=${API_URL}`, '_blank')}
              >
                <Eye size={15} /> Preview embed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
