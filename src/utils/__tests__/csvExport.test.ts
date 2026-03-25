import { describe, it, expect } from 'vitest';
import { buildCsvContent } from '../csvExport';
import type { ConsentLog } from '../csvExport';

const makeLog = (overrides: Partial<ConsentLog> = {}): ConsentLog => ({
  id: '1',
  visitor_id: 'abc-def-123',
  consent_data: { analytics: true, marketing: false },
  url: 'https://example.com',
  ip_address: '1.2.3.4',
  user_agent: 'Mozilla/5.0',
  created_at: '2026-01-15T10:00:00.000Z',
  ...overrides,
});

describe('buildCsvContent', () => {
  it('returns only the header row for empty logs', () => {
    const result = buildCsvContent([]);
    expect(result).toBe('Date,Visitor ID,URL,IP Address,Consent Details');
  });

  it('includes header and one data row for a single log', () => {
    const result = buildCsvContent([makeLog()]);
    const lines = result.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('Date,Visitor ID,URL,IP Address,Consent Details');
  });

  it('formats consent_data as key:yes/no joined by semicolons', () => {
    const result = buildCsvContent([makeLog({ consent_data: { analytics: true, marketing: false, essential: true } })]);
    expect(result).toContain('analytics:yes; marketing:no; essential:yes');
  });

  it('uses "Unknown" when visitor_id is empty', () => {
    const result = buildCsvContent([makeLog({ visitor_id: '' })]);
    expect(result).toContain('"Unknown"');
  });

  it('uses "Unknown" when visitor_id is undefined', () => {
    const log = makeLog();
    (log as any).visitor_id = undefined;
    const result = buildCsvContent([log]);
    expect(result).toContain('"Unknown"');
  });

  it('uses empty string when url is missing', () => {
    const result = buildCsvContent([makeLog({ url: '' })]);
    const lines = result.split('\n');
    expect(lines[1]).toContain('""');
  });

  it('produces correct number of rows for multiple logs', () => {
    const result = buildCsvContent([makeLog(), makeLog({ id: '2' }), makeLog({ id: '3' })]);
    const lines = result.split('\n');
    expect(lines).toHaveLength(4); // 1 header + 3 data rows
  });

  it('wraps each field in double quotes', () => {
    const result = buildCsvContent([makeLog()]);
    const dataRow = result.split('\n')[1];
    const fields = dataRow.split('","');
    expect(fields).toHaveLength(5);
    expect(dataRow.startsWith('"')).toBe(true);
    expect(dataRow.endsWith('"')).toBe(true);
  });
});
