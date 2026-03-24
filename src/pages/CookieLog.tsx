import { Download, FileText, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useCookieConfig } from '../context/CookieContext';
import { supabase } from '../lib/supabase';
import './CookieLog.css';

interface ConsentLog {
  id: string;
  visitor_id: string;
  consent_data: Record<string, boolean>;
  url: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export const CookieLog: React.FC = () => {
  const { userId } = useCookieConfig();
  const [logs, setLogs] = useState<ConsentLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchLogs = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const endIso = end.toISOString();

      const { data, error } = await supabase
        .from('visitor_consent')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', start)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false });

      if (error && error.code !== '42P01') { 
        console.error('Failed to fetch logs from DB:', error);
      }
      
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    
    const headers = ['Date', 'Visitor ID', 'URL', 'IP Address', 'Consent Details'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => {
        const date = new Date(log.created_at).toLocaleString();
        const consentStr = Object.entries(log.consent_data)
          .map(([k, v]) => `${k}:${v?'yes':'no'}`)
          .join('; ');
        
        return [
          `"${date}"`,
          `"${log.visitor_id || 'Unknown'}"`,
          `"${log.url || ''}"`,
          `"${log.ip_address || ''}"`,
          `"${consentStr}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `uterms_consent_logs_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="cookie-log-container">
      <div className="cookie-log-header">
        <h1>Cookie Log</h1>
        <p className="cookie-log-description">
          In accordance with the GDPR, we will store your consent log data for the past 180 days. 
          You can download your consent log report for any date range within the 180 days.
        </p>
      </div>

      <div className="cookie-log-controls">
        <div className="date-filters">
          <div className="date-input-group">
            <label>Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="date-input-group">
            <label>End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
          <button className="btn-filter" onClick={fetchLogs} disabled={isLoading}>
            <Search size={18} /> {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <button className="btn-export" onClick={handleExportCSV} disabled={logs.length === 0}>
          <Download size={18} /> Export to CSV
        </button>
      </div>

      <div className="cookie-log-table-container">
        {isLoading ? (
          <div className="cookie-log-empty">Loading logs...</div>
        ) : logs.length > 0 ? (
          <table className="cookie-log-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Visitor ID</th>
                <th>Consent Given</th>
                <th>Source URL</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td><span className="code-badge">{log.visitor_id?.substring(0, 12) || 'anon'}...</span></td>
                  <td>
                    <div className="consent-tags">
                      {Object.entries(log.consent_data).map(([cat, val]) => (
                        <span key={cat} className={`consent-tag ${val ? 'granted' : 'denied'}`}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="truncate-url" title={log.url}>{log.url || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="cookie-log-empty">
            <FileText size={48} className="text-gray-300 mb-4" />
            <p>No consent logs found for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
};
