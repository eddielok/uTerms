import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagementPolicy } from '../hooks/useManagementPolicy';
import '../pages/PolicyManagement.css';

interface ManagementPageProps {
  table: string;
  title: string;
  description: string;
  basePath: string;
  emptyText: string;
  emptySubText: string;
  createLabel: string;
  deleteConfirm: string;
}

export const ManagementPage: React.FC<ManagementPageProps> = ({
  table,
  title,
  description,
  basePath,
  emptyText,
  emptySubText,
  createLabel,
  deleteConfirm,
}) => {
  const navigate = useNavigate();
  const { policies, isLoading, deletingId, handleDelete } = useManagementPolicy(table);

  return (
    <div className="pm-container">
      <div className="pm-header">
        <div>
          <h1>{title}</h1>
          <p className="pm-description">{description}</p>
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
                        onClick={() => navigate(`${basePath}/${policy.id}/preview`)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="pm-btn-icon"
                        title="Edit"
                        onClick={() => navigate(`${basePath}/${policy.id}/edit`)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="pm-btn-icon danger"
                        title="Delete"
                        disabled={deletingId === policy.id}
                        onClick={() => handleDelete(policy.id, deleteConfirm)}
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
            <p>{emptyText}</p>
            <p className="pm-empty-sub">{emptySubText}</p>
            <button className="btn-create" onClick={() => navigate(`${basePath}/new`)}>
              <Plus size={16} /> {createLabel}
            </button>
          </div>
        )}
      </div>

      {policies.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <button className="btn-create" onClick={() => navigate(`${basePath}/new`)}>
            <Plus size={16} /> {createLabel}
          </button>
        </div>
      )}
    </div>
  );
};
