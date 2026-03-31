import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import './PolicyManagement.css';

interface Policy {
  id: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
}

export const TermsManagement: React.FC = () => {
  const { userId } = useCookieConfig();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    supabase
      .from('terms_of_service')
      .select('id, title, status, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error && error.code !== '42P01') console.error(error);
        setPolicies(data || []);
        setIsLoading(false);
      });
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this Terms of Service? This cannot be undone.')) return;
    setDeletingId(id);
    await supabase.from('terms_of_service').delete().eq('id', id);
    setPolicies((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="pm-container">
      <div className="pm-header">
        <div>
          <h1>Terms of Service</h1>
          <p className="pm-description">
            Generate and manage your Terms of Service using our step-by-step wizard.
          </p>
        </div>
      </div>

      <div className="pm-table-wrapper">
        {isLoading ? (
          <div className="pm-empty">Loading...</div>
        ) : policies.length > 0 ? (
          <table className="pm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id}>
                  <td>
                    <div className="pm-policy-name">
                      <FileText size={15} className="pm-file-icon" />
                      {policy.title}
                    </div>
                  </td>
                  <td>
                    <span className={`pm-status-badge ${policy.status}`}>
                      {policy.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="pm-date">
                    {new Date(policy.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="pm-actions">
                      <button
                        className="pm-btn-icon"
                        title="Preview"
                        onClick={() => navigate(`/terms-of-service/${policy.id}/preview`)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="pm-btn-icon"
                        title="Edit"
                        onClick={() => navigate(`/terms-of-service/${policy.id}/edit`)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="pm-btn-icon danger"
                        title="Delete"
                        disabled={deletingId === policy.id}
                        onClick={() => handleDelete(policy.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="pm-empty">
            <FileText size={44} className="pm-empty-icon" />
            <p>No Terms of Service yet.</p>
            <p className="pm-empty-sub">
              Use our step-by-step wizard to create your first Terms of Service.
            </p>
            <button
              className="btn-create"
              onClick={() => navigate('/terms-of-service/new')}
            >
              <Plus size={16} /> Create New Terms
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
