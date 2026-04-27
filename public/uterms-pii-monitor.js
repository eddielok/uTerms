(function () {
  // ── Config ────────────────────────────────────────────────────────────────────
  let userId = null;
  let apiBase = 'https://api.uterms.io';
  try {
    const scripts = document.getElementsByTagName('script');
    for (const s of scripts) {
      if (s.src && s.src.includes('uterms-pii-monitor.js')) {
        const u = new URL(s.src);
        userId = u.searchParams.get('id');
        const api = u.searchParams.get('api');
        if (api) {
          try {
            const parsed = new URL(api);
            apiBase = parsed.hostname === 'api.uterms.io' ? api : 'https://api.uterms.io';
          } catch { apiBase = 'https://api.uterms.io'; }
        }
        break;
      }
    }
  } catch (e) {}

  if (!userId) return; // nothing to report without an owner ID

  // ── PII patterns ──────────────────────────────────────────────────────────────
  const PII_PATTERNS = [
    { type: 'email',       re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { type: 'phone',       re: /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g },
    { type: 'ssn',         re: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g },
    { type: 'credit_card', re: /\b(?:\d[ -]?){15,16}\b/g },
  ];

  function luhn(str) {
    const d = str.replace(/\D/g, '');
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = parseInt(d[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function detectPii(text) {
    if (!text || typeof text !== 'string') return [];
    const found = new Set();
    for (const { type, re } of PII_PATTERNS) {
      const matches = text.match(re);
      if (!matches) continue;
      if (type === 'credit_card') {
        if (matches.some(m => luhn(m))) found.add(type);
      } else {
        found.add(type);
      }
    }
    return [...found];
  }

  // ── Deduplication — only report each domain+type pair once per session ────────
  const reported = new Set();

  // ── Reporting — batched, debounced ────────────────────────────────────────────
  let pending = [];
  let timer = null;

  function flush() {
    if (pending.length === 0) return;
    const batch = pending.splice(0);
    try {
      navigator.sendBeacon(
        apiBase + '/api/pii-report',
        new Blob([JSON.stringify({ userId, reports: batch })], { type: 'application/json' }),
      );
    } catch (e) {
      // sendBeacon failed — try fetch as fallback
      fetch(apiBase + '/api/pii-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reports: batch }),
        keepalive: true,
      }).catch(() => {});
    }
    timer = null;
  }

  function schedule() {
    if (!timer) timer = setTimeout(flush, 5000);
  }

  function report(domain, piiTypes, method, url) {
    const isThirdParty = !domain.includes(location.hostname.replace(/^www\./, ''));
    const newTypes = piiTypes.filter(t => {
      const key = domain + ':' + t;
      if (reported.has(key)) return false;
      reported.add(key);
      return true;
    });
    if (newTypes.length === 0) return;
    pending.push({
      domain,
      piiTypes: newTypes,
      thirdParty: isThirdParty,
      method,
      url: location.href,
      exampleUrl: url.slice(0, 200),
      timestamp: new Date().toISOString(),
    });
    schedule();
  }

  function checkUrl(rawUrl, method) {
    if (!rawUrl) return;
    let domain;
    try { domain = new URL(rawUrl).hostname.replace(/^www\./, ''); } catch { return; }
    if (!domain) return;
    const piiTypes = detectPii(rawUrl);
    if (piiTypes.length) report(domain, piiTypes, method, rawUrl);
  }

  function checkBody(rawUrl, body) {
    if (!body) return;
    let domain;
    try { domain = new URL(rawUrl, location.href).hostname.replace(/^www\./, ''); } catch { return; }
    let text = '';
    if (typeof body === 'string') text = body;
    else if (body instanceof URLSearchParams) text = body.toString();
    else if (body instanceof FormData) {
      body.forEach((v) => { if (typeof v === 'string') text += ' ' + v; });
    }
    if (!text) return;
    const piiTypes = detectPii(text);
    if (piiTypes.length) report(domain, piiTypes, 'POST', rawUrl);
  }

  // ── Intercept fetch ───────────────────────────────────────────────────────────
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = (init?.method || 'GET').toUpperCase();
    checkUrl(url, method);
    if (method !== 'GET') checkBody(url, init?.body);
    return origFetch.apply(this, arguments);
  };

  // ── Intercept XMLHttpRequest ──────────────────────────────────────────────────
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._piiUrl = url;
    this._piiMethod = (method || 'GET').toUpperCase();
    checkUrl(url, this._piiMethod);
    return origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this._piiMethod !== 'GET') checkBody(this._piiUrl, body);
    return origSend.apply(this, arguments);
  };

  // ── Intercept form submissions ────────────────────────────────────────────────
  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (!form) return;
    const action = form.action || location.href;
    const method = (form.method || 'GET').toUpperCase();
    try {
      const data = new FormData(form);
      let text = '';
      data.forEach((v) => { if (typeof v === 'string') text += ' ' + v; });
      const piiTypes = detectPii(text);
      let domain;
      try { domain = new URL(action, location.href).hostname.replace(/^www\./, ''); } catch { return; }
      if (piiTypes.length) report(domain, piiTypes, method, action);
    } catch (e) {}
  }, true);

  // Flush remaining reports when page unloads
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
})();
