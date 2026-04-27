import { AlertTriangle, Download, FlaskConical, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useCookieConfig } from '../context/CookieContext';
import { API_URL } from '../lib/config';
import { supabase } from '../lib/supabase';
import './CookieLog.css';
import './PiiAlerts.css';

interface PiiAlert {
  id: string;
  domain: string;
  pii_types: string[];
  third_party: boolean;
  method: string;
  page_url: string;
  created_at: string;
}

interface GroupedAlert {
  domain: string;
  pii_types: string[];
  third_party: boolean;
  count: number;
  last_seen: string;
  example_page: string;
}

const PII_LABEL: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  ssn: 'SSN',
  credit_card: 'Credit Card',
  ip_address: 'IP Address',
  passport: 'Passport',
};

// High-severity PII types that warrant a stronger visual indicator
const HIGH_SEVERITY = new Set(['ssn', 'credit_card', 'passport']);

function groupAlerts(alerts: PiiAlert[]): GroupedAlert[] {
  const map = new Map<string, GroupedAlert>();
  for (const a of alerts) {
    const key = a.domain;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      for (const t of a.pii_types) {
        if (!existing.pii_types.includes(t)) existing.pii_types.push(t);
      }
      if (a.third_party) existing.third_party = true;
      if (a.created_at > existing.last_seen) existing.last_seen = a.created_at;
    } else {
      map.set(key, {
        domain: a.domain,
        pii_types: [...a.pii_types],
        third_party: a.third_party,
        count: 1,
        last_seen: a.created_at,
        example_page: a.page_url,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export const PiiAlerts: React.FC = () => {
  const { userId } = useCookieConfig();
  const [alerts, setAlerts] = useState<PiiAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const monitorScript = `<script src="${API_URL}/uterms-pii-monitor.js?id=${userId || 'YOUR_USER_ID'}${API_URL !== 'https://api.uterms.io' ? `&api=${API_URL}` : ''}"></script>`;

  const fetchAlerts = async (silent = false) => {
    if (!userId) return;
    if (!silent) setIsLoading(true);
    try {
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate); end.setHours(23, 59, 59, 999);
      const { data, error } = await supabase
        .from('pii_alerts')
        .select('id, domain, pii_types, third_party, method, page_url, created_at')
        .eq('user_id', userId)
        .gte('created_at', start)
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);
      if (error && error.code !== '42P01') console.error('PII alerts fetch error:', error);
      setAlerts(data || []);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial fetch + auto-refresh every 30 s
  useEffect(() => {
    if (!userId) return;
    fetchAlerts();
    intervalRef.current = setInterval(() => fetchAlerts(true), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [userId]); // eslint-disable-line

  const grouped = groupAlerts(alerts);
  const thirdPartyCount = new Set(alerts.filter(a => a.third_party).map(a => a.domain)).size;
  const uniqueDomains = new Set(alerts.map(a => a.domain)).size;

  const handleExport = () => {
    if (grouped.length === 0) return;
    const rows = [
      ['Domain', 'PII Types', '3rd Party', 'Occurrences', 'Example Page', 'Last Seen'],
      ...grouped.map(g => [
        g.domain,
        g.pii_types.map(t => PII_LABEL[t] || t).join('; '),
        g.third_party ? 'Yes' : 'No',
        String(g.count),
        g.example_page,
        new Date(g.last_seen).toLocaleString(),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pii_alerts_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="pii-container">
      <div className="pii-header">
        <div>
          <h1>PII Leak Monitor</h1>
          <p className="pii-description">
            Real-time detection of personally identifiable information (email, phone, SSN, credit card)
            sent in outgoing network requests on your website. Add the monitor script below to enable.
          </p>
        </div>
      </div>

      {/* Embed snippet */}
      <div className="pii-snippet-card">
        <div className="pii-snippet-header">
          <div className="pii-snippet-title">Monitor Script — add before <code>&lt;/body&gt;</code></div>
          <a
            className="pii-test-link"
            href={`${API_URL}/test-pii-monitor.html?id=${userId || ''}&api=${API_URL}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FlaskConical size={13} /> Live Test Page
          </a>
        </div>
        <div className="pii-snippet-code">
          <pre>{monitorScript}</pre>
          <button
            className="pii-snippet-copy"
            onClick={() => navigator.clipboard.writeText(monitorScript)}
          >
            Copy
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="pii-stats">
        <div className="pii-stat-card">
          <ShieldAlert size={20} color="#dc2626" />
          <div>
            <div className="pii-stat-value">{alerts.length}</div>
            <div className="pii-stat-label">Total Alerts</div>
          </div>
        </div>
        <div className="pii-stat-card">
          <AlertTriangle size={20} color="#d97706" />
          <div>
            <div className="pii-stat-value">{thirdPartyCount}</div>
            <div className="pii-stat-label">3rd Party Domains</div>
          </div>
        </div>
        <div className="pii-stat-card">
          <ShieldCheck size={20} color="#059669" />
          <div>
            <div className="pii-stat-value">{uniqueDomains}</div>
            <div className="pii-stat-label">Unique Domains</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="cookie-log-controls">
        <div className="date-filters">
          <div className="date-input-group">
            <label>From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="date-input-group">
            <label>To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="btn-filter" onClick={() => fetchAlerts()} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'pii-spin' : ''} />
            {isLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        <button className="btn-export" onClick={handleExport} disabled={grouped.length === 0}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="cookie-log-table-container">
        {grouped.length === 0 ? (
          <div className="cookie-log-empty">
            {isLoading ? 'Loading…' : (
              <>
                <ShieldCheck size={36} color="#d1d5db" />
                <span>No PII alerts in this period.</span>
                <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                  Add the monitor script to your site to start detecting leaks.
                </span>
              </>
            )}
          </div>
        ) : (
          <table className="cookie-log-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>PII Detected</th>
                <th>Party</th>
                <th>Occurrences</th>
                <th>Example Page</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(g => {
                const isHigh = g.pii_types.some(t => HIGH_SEVERITY.has(t));
                return (
                  <tr key={g.domain} className={isHigh ? 'pii-row-high' : undefined}>
                    <td><span className="code-badge">{g.domain}</span></td>
                    <td>
                      <div className="consent-tags">
                        {g.pii_types.map(t => (
                          <span
                            key={t}
                            className={`pii-type-badge${HIGH_SEVERITY.has(t) ? ' pii-type-badge--high' : ''}`}
                          >
                            {PII_LABEL[t] || t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`consent-tag ${g.third_party ? 'denied' : 'granted'}`}>
                        {g.third_party ? '3rd party' : '1st party'}
                      </span>
                    </td>
                    <td>
                      <span className="pii-count-badge">{g.count}</span>
                    </td>
                    <td><div className="truncate-url" title={g.example_page}>{g.example_page}</div></td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem', color: '#6b7280' }}>
                      {new Date(g.last_seen).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
