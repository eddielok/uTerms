import { ArrowLeft, Check, Code, Copy, Download, Eye, Globe, Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCookieConfig } from '../context/CookieContext';
import './PolicyPreview.css';

interface Policy {
  id: string;
  title: string;
  status: 'draft' | 'published';
  generated: string;
  updated_at: string;
}

export const TermsPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useCookieConfig();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('terms_of_service')
        .select('id, title, status, generated, updated_at')
        .eq('id', id)
        .single();
      setPolicy(data || null);
      setIsLoading(false);
    })();
  }, [id]);

  const handleCopy = async () => {
    if (!policy?.generated) return;
    const text = policy.generated.replace(/<[^>]+>/g, '').replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&amp;/g, '&');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!policy?.generated) return;
    const text = policy.generated.replace(/<[^>]+>/g, '').replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&amp;/g, '&');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTogglePublish = async () => {
    if (!policy) return;
    setIsToggling(true);
    const newStatus = policy.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('terms_of_service')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', policy.id);
    if (!error) {
      setPolicy(prev => prev ? { ...prev, status: newStatus } : prev);
    }
    setIsToggling(false);
  };

  const embedScript = userId
    ? `<!-- Step 1: place this where you want the Terms of Service to appear -->\n<div id="uterms-tos"></div>\n\n<!-- Step 2: add this script tag (e.g. before </body>) -->\n<script src="http://localhost:3001/uterms-tos-embed.js?id=${userId}"></script>`
    : '';

  const handleCopyEmbed = async () => {
    if (!embedScript) return;
    await navigator.clipboard.writeText(embedScript);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="preview-loading">Loading policy...</div>;
  }

  if (!policy) {
    return (
      <div className="preview-loading">
        <p>Policy not found.</p>
        <button className="preview-back-btn" onClick={() => navigate('/terms-of-service')}>
          <ArrowLeft size={16} /> Back to Policies
        </button>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div className="preview-topbar">
        <button className="preview-back-btn" onClick={() => navigate('/terms-of-service')}>
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
          <button className="preview-btn" onClick={() => navigate(`/terms-of-service/${id}/edit`)}>
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
        <p className="preview-updated">Last updated: {new Date(policy.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="preview-doc-wrapper">
        <div
          className="preview-doc"
          dangerouslySetInnerHTML={{ __html: policy.generated || '<p>No content generated.</p>' }}
        />
      </div>

      <div className="embed-section">
        <div className="embed-section-header">
          <Code size={18} />
          <h2>Embed on your website</h2>
        </div>

        {policy.status !== 'published' ? (
          <p className="embed-notice">Publish this Terms of Service first to get the embed snippet.</p>
        ) : (
          <>
            <p className="embed-description">
              Paste the snippet below into any page to display your Terms of Service. Place the{' '}
              <code>&lt;div&gt;</code> where you want it to appear, and the{' '}
              <code>&lt;script&gt;</code> tag before <code>&lt;/body&gt;</code>.
            </p>
            <div className="embed-code-block">
              <pre>{embedScript}</pre>
              <button className="embed-copy-btn" onClick={handleCopyEmbed}>
                {embedCopied ? <Check size={14} /> : <Copy size={14} />}
                {embedCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div style={{ display: 'flex' }}>
              <button
                className="embed-preview-btn"
                onClick={() => window.open(`/test-tos.html?id=${userId}`, '_blank')}
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
