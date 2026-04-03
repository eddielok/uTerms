import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import { htmlToText } from '../utils/htmlToText';

export interface PreviewPolicy {
  id: string;
  title: string;
  status: 'draft' | 'published';
  generated: string;
  updated_at: string;
}

export function usePreviewPolicy(table: string) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useCookieConfig();
  const [policy, setPolicy] = useState<PreviewPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from(table)
        .select('id, title, status, generated, updated_at')
        .eq('id', id)
        .single();
      setPolicy((data as PreviewPolicy) || null);
      setIsLoading(false);
    })();
  }, [id, table]);

  const handleCopy = async () => {
    if (!policy?.generated) return;
    await navigator.clipboard.writeText(htmlToText(policy.generated));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!policy?.generated) return;
    const text = htmlToText(policy.generated);
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
      .from(table)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', policy.id);
    if (!error) setPolicy(prev => prev ? { ...prev, status: newStatus } : prev);
    setIsToggling(false);
  };

  const handleCopyEmbed = async (embedScript: string) => {
    await navigator.clipboard.writeText(embedScript);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  return {
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
  };
}
