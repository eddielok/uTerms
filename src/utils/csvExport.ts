export interface ConsentLog {
  id: string;
  visitor_id: string;
  consent_data: Record<string, boolean>;
  url: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export function buildCsvContent(logs: ConsentLog[]): string {
  const headers = ['Date', 'Visitor ID', 'URL', 'IP Address', 'Consent Details'];
  return [
    headers.join(','),
    ...logs.map(log => {
      const date = new Date(log.created_at).toLocaleString();
      const consentStr = Object.entries(log.consent_data)
        .map(([k, v]) => `${k}:${v ? 'yes' : 'no'}`)
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
}
