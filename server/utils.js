function categorizeCookie(cookie) {
  const name = cookie.name.toLowerCase();

  if (name.startsWith('_ga') || name.startsWith('_gid') || name.startsWith('_hj') || name.includes('analytics') || name.includes('mixpanel')) {
    return 'analytics';
  }
  if (name.startsWith('_fbp') || name.startsWith('_gcl') || name.includes('marketing') || name.includes('ads') || name.includes('pixel')) {
    return 'marketing';
  }
  if (name.includes('csrf') || name.includes('session') || name.includes('auth') || name.includes('token') || name.includes('__stripe')) {
    return 'essential';
  }
  if (name.includes('lang') || name.startsWith('__cf') || name.includes('cf_clearance') || name.includes('cookie') || name.includes('consent')) {
    return 'functional';
  }

  return 'unclassified';
}

function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

module.exports = { categorizeCookie, normalizeUrl };
