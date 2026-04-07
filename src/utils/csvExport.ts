export interface ConsentLog {
  id: string;
  visitor_id: string;
  consent_data: Record<string, boolean>;
  url: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

function recordFingerprint(log: ConsentLog): string {
  // Deterministic fingerprint for tamper-evidence in exported records.
  // Note: for legally binding proof, use a server-side HMAC endpoint instead.
  const raw = [log.id, log.visitor_id, log.created_at, JSON.stringify(log.consent_data), log.url].join('|');
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = (Math.imul(31, h) + raw.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function escapeCsv(value: string | undefined | null): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function buildCsvContent(logs: ConsentLog[]): string {
  const headers = ['Date (UTC)', 'Unix Timestamp', 'Record ID', 'Visitor ID', 'URL', 'IP Address', 'User Agent', 'Consent Details', 'Fingerprint'];
  return [
    headers.join(','),
    ...logs.map(log => {
      const date = new Date(log.created_at).toUTCString();
      const unix = Math.floor(new Date(log.created_at).getTime() / 1000);
      const consentStr = Object.entries(log.consent_data)
        .map(([k, v]) => `${k}:${v ? 'yes' : 'no'}`)
        .join('; ');
      return [
        escapeCsv(date),
        String(unix),
        escapeCsv(log.id),
        escapeCsv(log.visitor_id),
        escapeCsv(log.url),
        escapeCsv(log.ip_address),
        escapeCsv(log.user_agent),
        escapeCsv(consentStr),
        recordFingerprint(log),
      ].join(',');
    })
  ].join('\n');
}
