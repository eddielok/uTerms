// ─── Cookie knowledge base ────────────────────────────────────────────────────
// Maps known cookie names → { category, description, provider }
const KNOWN_COOKIES = {
  // ── Essential ──────────────────────────────────────────────────────────────
  connect_sid:          { category: 'essential', description: 'Express.js session identifier. Keeps the user logged in during their visit.', provider: 'Node.js / Express' },
  phpsessid:            { category: 'essential', description: 'PHP session identifier. Maintains server-side session state for the current visitor.', provider: 'PHP' },
  jsessionid:           { category: 'essential', description: 'Java/Tomcat session identifier. Required for authenticated server sessions.', provider: 'Java Servlet' },
  asp_net_sessionid:    { category: 'essential', description: 'ASP.NET session identifier. Stores session data for the duration of the visit.', provider: 'ASP.NET' },
  laravel_session:      { category: 'essential', description: 'Laravel session cookie. Required for authentication and CSRF protection.', provider: 'Laravel' },
  remember_token:       { category: 'essential', description: '"Remember me" token used to keep the user logged in across browser sessions.', provider: 'Application' },
  wordpress_logged_in:  { category: 'essential', description: 'Set by WordPress when a user is logged in. Required for the admin and member areas.', provider: 'WordPress' },
  '__stripe_sid':       { category: 'essential', description: 'Stripe fraud-prevention session cookie. Required to complete secure payment transactions.', provider: 'Stripe' },
  '__stripe_mid':       { category: 'essential', description: 'Stripe machine identifier for fraud detection. Required for secure payments.', provider: 'Stripe' },
  awsalb:               { category: 'essential', description: 'AWS Application Load Balancer sticky-session cookie. Ensures requests reach the same backend server.', provider: 'Amazon Web Services' },
  awsalbcors:           { category: 'essential', description: 'AWS ALB CORS session cookie for cross-origin load balancer routing.', provider: 'Amazon Web Services' },
  sb_access_token:      { category: 'essential', description: 'Supabase access token used for authenticated API requests.', provider: 'Supabase' },
  sb_refresh_token:     { category: 'essential', description: 'Supabase refresh token used to renew the access token without re-login.', provider: 'Supabase' },

  // ── Analytics ──────────────────────────────────────────────────────────────
  _ga:       { category: 'analytics', description: 'Google Analytics — distinguishes unique visitors. Persists for 2 years.', provider: 'Google Analytics' },
  _gid:      { category: 'analytics', description: 'Google Analytics — distinguishes unique visitors for 24 hours.', provider: 'Google Analytics' },
  _gat:      { category: 'analytics', description: 'Google Analytics — rate-limits the number of requests sent to Google servers.', provider: 'Google Analytics' },
  __utma:    { category: 'analytics', description: 'Google Analytics (legacy) — tracks visits, first visit, and last visit times.', provider: 'Google Analytics (UA)' },
  __utmb:    { category: 'analytics', description: 'Google Analytics (legacy) — stores the current session start time.', provider: 'Google Analytics (UA)' },
  __utmc:    { category: 'analytics', description: 'Google Analytics (legacy) — session cookie; expires when browser is closed.', provider: 'Google Analytics (UA)' },
  __utmt:    { category: 'analytics', description: 'Google Analytics (legacy) — throttles request rate to Google servers.', provider: 'Google Analytics (UA)' },
  __utmz:    { category: 'analytics', description: 'Google Analytics (legacy) — stores the traffic source that led to the visit.', provider: 'Google Analytics (UA)' },
  _hjid:             { category: 'analytics', description: 'Hotjar — unique visitor ID used to track visitor sessions across pages.', provider: 'Hotjar' },
  _hjfirstseen:      { category: 'analytics', description: 'Hotjar — marks the first session of a new visitor.', provider: 'Hotjar' },
  _hjsessionuser:    { category: 'analytics', description: 'Hotjar — persists the Hotjar User ID and session data.', provider: 'Hotjar' },
  _hjabsoluteexternalid: { category: 'analytics', description: 'Hotjar — stores an external user ID for cross-device visitor tracking.', provider: 'Hotjar' },
  _clck:  { category: 'analytics', description: 'Microsoft Clarity — persists the Clarity User ID and session preferences.', provider: 'Microsoft Clarity' },
  _clsk:  { category: 'analytics', description: 'Microsoft Clarity — connects multiple page-views in a single session.', provider: 'Microsoft Clarity' },
  _pk_id: { category: 'analytics', description: 'Matomo/Piwik — stores a unique visitor ID and visit statistics.', provider: 'Matomo' },
  _pk_ses:{ category: 'analytics', description: 'Matomo/Piwik — temporary session cookie; expires after 30 minutes of inactivity.', provider: 'Matomo' },
  _gespsk_rtbhouse: { category: 'analytics', description: 'RTB House — analytics and retargeting session identifier.', provider: 'RTB House' },

  // ── Marketing ──────────────────────────────────────────────────────────────
  _fbp:        { category: 'marketing', description: 'Facebook Pixel — identifies browsers for ad delivery, measurement, and retargeting.', provider: 'Meta (Facebook)' },
  _fbc:        { category: 'marketing', description: 'Facebook Click ID — stores a click identifier when a user arrives via a Facebook ad.', provider: 'Meta (Facebook)' },
  fr:          { category: 'marketing', description: 'Facebook — primary advertising cookie; used to deliver and measure ad relevance.', provider: 'Meta (Facebook)' },
  ide:         { category: 'marketing', description: 'Google DoubleClick — stores user preferences to serve targeted advertisements.', provider: 'Google DoubleClick' },
  dsid:        { category: 'marketing', description: 'Google DoubleClick — identifies signed-in Google users for ad personalisation.', provider: 'Google DoubleClick' },
  __gads:      { category: 'marketing', description: 'Google Ad Manager — used to show ads and track ad performance on publisher sites.', provider: 'Google Ad Manager' },
  __gpi:       { category: 'marketing', description: 'Google Publisher Tags — stores user preferences for targeted advertising.', provider: 'Google Ad Manager' },
  __eoi:       { category: 'marketing', description: 'Google Ads — stores encrypted Google user ID for conversion tracking.', provider: 'Google Ads' },
  nid:         { category: 'marketing', description: 'Google — stores preferences and signed-out user information for personalised ads.', provider: 'Google' },
  anid:        { category: 'marketing', description: 'Google — used for advertising purposes based on activity on Google services.', provider: 'Google' },
  fccdcf:      { category: 'marketing', description: 'Google Funding Choices — stores ad consent decisions under GDPR/CCPA.', provider: 'Google Funding Choices' },
  fcnec:       { category: 'marketing', description: 'Google Funding Choices — stores non-EU ad consent settings.', provider: 'Google Funding Choices' },
  cto_bundle:  { category: 'marketing', description: 'Criteo — cross-site retargeting token used to serve personalised ads.', provider: 'Criteo' },
  cto_bidid:   { category: 'marketing', description: 'Criteo — bid identifier used for real-time ad bidding and targeting.', provider: 'Criteo' },
  uid:         { category: 'marketing', description: 'Criteo — anonymous user identifier used for ad targeting and retargeting.', provider: 'Criteo' },
  muid:        { category: 'marketing', description: 'Microsoft Bing Ads — unique user identifier for advertising and analytics.', provider: 'Microsoft / Bing' },
  _uetsid:     { category: 'marketing', description: 'Microsoft Universal Event Tracking — tracks site visits and user actions for Bing Ads.', provider: 'Microsoft / Bing' },
  _uetvid:     { category: 'marketing', description: 'Microsoft UET — persistent cookie used to recognise returning visitors for retargeting.', provider: 'Microsoft / Bing' },
  msclkid:     { category: 'marketing', description: 'Microsoft Click ID — auto-tagging parameter for Bing Ads conversion tracking.', provider: 'Microsoft / Bing' },
  _ttp:        { category: 'marketing', description: 'TikTok Pixel — measures ad effectiveness and builds custom audiences on TikTok.', provider: 'TikTok' },
  anj:         { category: 'marketing', description: 'AppNexus / Xandr — anonymous user identifier for programmatic ad targeting.', provider: 'Xandr (AppNexus)' },
  uuid2:       { category: 'marketing', description: 'AppNexus / Xandr — stores a unique user ID for ad auction bidding.', provider: 'Xandr (AppNexus)' },
  _pin_unauth: { category: 'marketing', description: 'Pinterest — tracks anonymous visitors for conversion measurement on Pinterest.', provider: 'Pinterest' },

  // ── Social ──────────────────────────────────────────────────────────────────
  c_user:   { category: 'social', description: 'Facebook — stores the Facebook user ID of the currently logged-in user.', provider: 'Meta (Facebook)' },
  xs:       { category: 'social', description: 'Facebook — session token paired with c_user for authentication.', provider: 'Meta (Facebook)' },
  datr:     { category: 'social', description: 'Facebook — browser identifier created when a user first visits Facebook.', provider: 'Meta (Facebook)' },
  sb:       { category: 'social', description: 'Facebook — browser identifier used to improve login security.', provider: 'Meta (Facebook)' },
  twid:     { category: 'social', description: 'Twitter/X — stores the Twitter user ID for authentication and personalisation.', provider: 'Twitter / X' },
  ct0:      { category: 'social', description: 'Twitter/X — CSRF token used to protect authenticated Twitter requests.', provider: 'Twitter / X' },
  auth_token: { category: 'social', description: 'Twitter/X — session authentication token for the logged-in Twitter user.', provider: 'Twitter / X' },
  li_at:    { category: 'social', description: 'LinkedIn — primary authentication cookie that keeps the user logged in.', provider: 'LinkedIn' },
  liap:     { category: 'social', description: 'LinkedIn — used to authenticate LinkedIn members on 3rd-party sites via LinkedIn Login.', provider: 'LinkedIn' },
  lidc:     { category: 'social', description: 'LinkedIn — facilitates data centre selection for user traffic routing.', provider: 'LinkedIn' },
  bcookie:  { category: 'social', description: 'LinkedIn — browser identifier cookie set at first visit to LinkedIn.', provider: 'LinkedIn' },
  bscookie: { category: 'social', description: 'LinkedIn — secure browser ID used to remember a user across LinkedIn services.', provider: 'LinkedIn' },
  usermatchhistory: { category: 'social', description: 'LinkedIn — enables LinkedIn to match users to ad audiences.', provider: 'LinkedIn' },
  visitor_info1_live: { category: 'social', description: 'YouTube — estimates user bandwidth to select appropriate video quality.', provider: 'YouTube (Google)' },
  ysc:      { category: 'social', description: 'YouTube — session cookie used to track views of embedded videos.', provider: 'YouTube (Google)' },
  ig_did:   { category: 'social', description: 'Instagram — device identifier used for authentication and security.', provider: 'Instagram (Meta)' },

  // ── Functional ─────────────────────────────────────────────────────────────
  __cf_bm:      { category: 'functional', description: 'Cloudflare Bot Management — distinguishes human visitors from automated bots.', provider: 'Cloudflare' },
  cf_clearance: { category: 'functional', description: 'Cloudflare — confirms the visitor has passed a browser integrity check.', provider: 'Cloudflare' },
  cookieyes_consent: { category: 'functional', description: 'CookieYes GDPR/CCPA consent banner — stores the visitor\'s cookie consent preferences.', provider: 'CookieYes' },
  cookieconsent_status: { category: 'functional', description: 'Cookie Consent plugin — records whether the user has accepted or declined cookies.', provider: 'Cookie Consent' },
  viewed_cookie_policy: { category: 'functional', description: 'Records that the visitor has viewed the cookie policy, suppressing the banner on return visits.', provider: 'Application' },
  euconsent_v2: { category: 'functional', description: 'IAB TCF v2 — stores the visitor\'s consent string for GDPR purposes.', provider: 'IAB TCF' },
  usprivacy:    { category: 'functional', description: 'IAB CCPA — stores the US Privacy string representing the visitor\'s opt-out choices.', provider: 'IAB CCPA Framework' },
};

// ─── Domain category overrides ─────────────────────────────────────────────
const DOMAIN_RULES = [
  // Social platforms
  { match: ['facebook.com', 'fb.com'],                          category: 'social'     },
  { match: ['instagram.com'],                                    category: 'social'     },
  { match: ['twitter.com', 'x.com', 't.co'],                    category: 'social'     },
  { match: ['linkedin.com'],                                     category: 'social'     },
  { match: ['pinterest.com'],                                    category: 'social'     },
  { match: ['tiktok.com', 'tiktokcdn.com'],                      category: 'social'     },
  { match: ['reddit.com', 'redd.it'],                            category: 'social'     },
  { match: ['snapchat.com'],                                     category: 'social'     },
  { match: ['addthis.com', 'addtoany.com', 'sharethis.com'],     category: 'social'     },

  // Advertising / Marketing networks
  { match: ['doubleclick.net', 'googlesyndication.com', 'googleadservices.com'], category: 'marketing' },
  { match: ['adnxs.com', 'adnxs-simple.com'],                   category: 'marketing'  },
  { match: ['criteo.com', 'criteo.net', 'criteo.us'],            category: 'marketing'  },
  { match: ['bing.com'],                                         category: 'marketing'  },
  { match: ['adroll.com'],                                       category: 'marketing'  },
  { match: ['rubiconproject.com'],                               category: 'marketing'  },
  { match: ['pubmatic.com'],                                     category: 'marketing'  },
  { match: ['openx.net', 'openx.com'],                           category: 'marketing'  },
  { match: ['taboola.com'],                                      category: 'marketing'  },
  { match: ['outbrain.com'],                                     category: 'marketing'  },
  { match: ['thetradedesk.com', 'adsrvr.org'],                   category: 'marketing'  },
  { match: ['demdex.net'],                                       category: 'marketing'  },
  { match: ['scorecardresearch.com'],                            category: 'marketing'  },
  { match: ['quantserve.com'],                                   category: 'marketing'  },
  { match: ['casalemedia.com'],                                  category: 'marketing'  },
  { match: ['contextweb.com'],                                   category: 'marketing'  },
  { match: ['smartadserver.com'],                                category: 'marketing'  },
  { match: ['moatads.com', 'moat.com'],                          category: 'marketing'  },
  { match: ['rtbhouse.com'],                                     category: 'marketing'  },
  { match: ['spotxchange.com', 'spotx.tv'],                      category: 'marketing'  },
  { match: ['lijit.com'],                                        category: 'marketing'  },
  { match: ['tribalfusion.com'],                                 category: 'marketing'  },
  { match: ['advertising.com'],                                  category: 'marketing'  },

  // Analytics platforms
  { match: ['google-analytics.com'],                             category: 'analytics'  },
  { match: ['hotjar.com'],                                       category: 'analytics'  },
  { match: ['amplitude.com'],                                    category: 'analytics'  },
  { match: ['mixpanel.com'],                                     category: 'analytics'  },
  { match: ['segment.com', 'segment.io'],                        category: 'analytics'  },
  { match: ['fullstory.com'],                                    category: 'analytics'  },
  { match: ['logrocket.com'],                                    category: 'analytics'  },
  { match: ['mouseflow.com'],                                    category: 'analytics'  },
  { match: ['clarity.ms'],                                       category: 'analytics'  },
  { match: ['heapanalytics.com', 'heap.io'],                     category: 'analytics'  },
  { match: ['crazyegg.com'],                                     category: 'analytics'  },
  { match: ['luckyorange.com'],                                  category: 'analytics'  },
  { match: ['kissmetrics.com'],                                  category: 'analytics'  },
  { match: ['chartbeat.com'],                                    category: 'analytics'  },
  { match: ['omtrdc.net', 'decibelinsight.net'],                 category: 'analytics'  },

  // Security / CDN (functional)
  { match: ['cloudflare.com'],                                   category: 'functional' },
  { match: ['imperva.com', 'incapsula.com'],                     category: 'functional' },
  { match: ['akamai.com', 'akamaitech.net'],                     category: 'functional' },
  { match: ['fastly.com'],                                       category: 'functional' },
];

// ─── Name-based pattern rules (ordered: most specific first) ───────────────
const NAME_RULES = [
  // Essential
  { test: n => ['connect.sid','phpsessid','jsessionid','asp.net_sessionid','laravel_session','sessionid','remember_token','sb-access-token','sb-refresh-token'].includes(n), category: 'essential' },
  { test: n => n.startsWith('__stripe_'),                       category: 'essential'  },
  { test: n => n.startsWith('__secure-'),                       category: 'essential'  },
  { test: n => n.startsWith('__host-'),                         category: 'essential'  },
  { test: n => n.startsWith('awsalb'),                          category: 'essential'  },
  { test: n => n.startsWith('incap_ses_'),                      category: 'essential'  },
  { test: n => n.startsWith('visid_incap_'),                    category: 'essential'  },
  { test: n => n.startsWith('next-auth.'),                      category: 'essential'  },
  { test: n => n.includes('csrf') || n.includes('xsrf'),        category: 'essential'  },
  { test: n => n.includes('session') && !n.includes('hotjar'), category: 'essential'  },
  { test: n => n.includes('auth') && !n.startsWith('_ga'),      category: 'essential'  },
  { test: n => n.includes('token') && !n.includes('hotjar'),    category: 'essential'  },
  { test: n => n === 'wordpress_logged_in',                     category: 'essential'  },
  { test: n => n.includes('login') && !n.includes('marketing'), category: 'essential'  },
  { test: n => n.includes('security') || n.includes('nonce'),   category: 'essential'  },

  // Analytics
  { test: n => n.startsWith('_ga'),                             category: 'analytics'  },
  { test: n => n.startsWith('_gid'),                            category: 'analytics'  },
  { test: n => n.startsWith('_gat'),                            category: 'analytics'  },
  { test: n => ['__utma','__utmb','__utmc','__utmt','__utmz','__utmv'].includes(n), category: 'analytics' },
  { test: n => n.startsWith('_hj') || n.startsWith('hjsession'), category: 'analytics' },
  { test: n => n === '_clck' || n === '_clsk',                  category: 'analytics'  },
  { test: n => n.startsWith('amplitude_') || n.startsWith('amp_'), category: 'analytics' },
  { test: n => n.startsWith('ajs_'),                            category: 'analytics'  },
  { test: n => n.startsWith('mp_'),                             category: 'analytics'  },
  { test: n => n.startsWith('_pk_') || n.startsWith('_paq'),    category: 'analytics'  },
  { test: n => n.startsWith('heap_') || n.startsWith('_hp2_'),  category: 'analytics'  },
  { test: n => n.startsWith('fs_') || n.startsWith('fs.'),      category: 'analytics'  },
  { test: n => n.startsWith('mf_'),                             category: 'analytics'  },
  { test: n => n.startsWith('lr_'),                             category: 'analytics'  },
  { test: n => n.startsWith('_vis_opt_') || n.startsWith('_vwo_'), category: 'analytics' },
  { test: n => n.startsWith('optimizely'),                      category: 'analytics'  },
  { test: n => n.includes('analytics') || n.includes('pageview') || n.includes('hitcount'), category: 'analytics' },
  { test: n => n === '_gespsk-rtbhouse' || n === '_gespsk_rtbhouse', category: 'analytics' },

  // Marketing
  { test: n => ['_fbp','_fbc','fr','ide','dsid','__gads','__gpi','__eoi','nid','anid','fccdcf','fcnec','cto_bundle','cto_bidid','uid','muid','_uetsid','_uetvid','msclkid','_ttp','anj','uuid2','_pin_unauth'].includes(n), category: 'marketing' },
  { test: n => n.startsWith('_gcl_'),                           category: 'marketing'  },
  { test: n => n.startsWith('tt_webid') || n.startsWith('tt_pixel'), category: 'marketing' },
  { test: n => n.startsWith('__adroll') || n.startsWith('adroll_'), category: 'marketing' },
  { test: n => n.startsWith('ttd_') || n.startsWith('tuuid'),   category: 'marketing'  },
  { test: n => n.startsWith('criteo'),                          category: 'marketing'  },
  { test: n => n.includes('marketing') || n.includes('retarget') || n.includes('advertis'), category: 'marketing' },
  { test: n => n.includes('pixel') && !n.includes('analytics'), category: 'marketing'  },
  { test: n => n.includes('campaign') || n.includes('conversion') || n.includes('affiliate'), category: 'marketing' },

  // Social
  { test: n => ['c_user','xs','datr','sb','fr','acts','twid','ct0','auth_token','kdt','li_at','liap','lidc','bcookie','bscookie','usermatchhistory','ig_did','ig_nrcb'].includes(n), category: 'social' },
  { test: n => n.startsWith('_twitter_'),                       category: 'social'     },
  { test: n => n.startsWith('li_') && !n.startsWith('lib'),     category: 'social'     },
  { test: n => n.includes('social') || (n.includes('share') && !n.includes('sharepoint')), category: 'social' },

  // Functional
  { test: n => n.startsWith('__cf') || n === 'cf_clearance',    category: 'functional' },
  { test: n => n.startsWith('ck') && n.length > 2,              category: 'functional' },
  { test: n => n.startsWith('yt-remote-') || n.startsWith('yt_'), category: 'functional' },
  { test: n => ['ysc','visitor_info1_live','use_hitbox'].includes(n), category: 'functional' },
  { test: n => ['euconsent-v2','euconsent_v2','usprivacy','cmpro','cmps','optoutmultisite'].includes(n), category: 'functional' },
  { test: n => n.includes('consent') || n.includes('gdpr') || n.includes('ccpa'), category: 'functional' },
  { test: n => ['cookieyes-consent','cookieyes','cookieconsent','cookieconsent_status','viewed_cookie_policy','cookie_notice_accepted'].includes(n), category: 'functional' },
  { test: n => n.includes('lang') || n.includes('language') || n.includes('locale'), category: 'functional' },
  { test: n => n.includes('timezone') || n.includes('currency') || n.includes('region'), category: 'functional' },
  { test: n => n.includes('theme') || n.includes('dark_mode') || n.includes('color_scheme'), category: 'functional' },
  { test: n => n.includes('prefer') || n.includes('recently_viewed') || n.includes('wishlist'), category: 'functional' },
  { test: n => n.startsWith('intercom-') || n.startsWith('zd-') || n.startsWith('zen_'), category: 'functional' },
  { test: n => n.startsWith('wp-settings') || (n.startsWith('wordpress_') && !n.includes('logged')), category: 'functional' },
  { test: n => n.includes('cart') || n === 'woocommerce_cart_hash' || n === 'woocommerce_items_in_cart', category: 'functional' },
];

// ─── Description lookup for common cookies ─────────────────────────────────
function lookupDescription(name, domain) {
  const key = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (KNOWN_COOKIES[key]) return KNOWN_COOKIES[key].description;

  // GA4 property-scoped cookies  (_ga_XXXXXXXX)
  if (/^_ga_/.test(name)) return 'Google Analytics 4 — measurement ID-scoped cookie that stores session state and event data.';
  if (/^_gat_/.test(name)) return 'Google Analytics — rate-limiting cookie tied to a specific GA property.';
  if (/^_hj/.test(name))   return 'Hotjar — visitor session and analytics data for heatmaps and recordings.';
  if (/^_gcl_/.test(name)) return 'Google Ads Conversion Linker — associates ad clicks with conversions.';
  if (/^amplitude_/.test(name)) return 'Amplitude Analytics — stores session and user data for product analytics.';
  if (/^mp_/.test(name))   return 'Mixpanel — tracks events and user properties for product analytics.';
  if (/^_pk_/.test(name))  return 'Matomo (Piwik) — stores visitor data for self-hosted web analytics.';
  if (/^ajs_/.test(name))  return 'Segment — analytics SDK identifier for event tracking.';
  if (/^tt_webid/.test(name)) return 'TikTok Pixel — tracks user behaviour for TikTok ad measurement.';
  if (/^__cf/.test(name))  return 'Cloudflare — provides CDN, DDoS protection, and bot management services.';
  if (/^incap_ses_/.test(name)) return 'Imperva Incapsula — security cookie for DDoS mitigation and bot detection.';
  if (/^visid_incap_/.test(name)) return 'Imperva Incapsula — visitor identifier for security and rate-limiting purposes.';
  if (/^awsalb/.test(name)) return 'AWS Application Load Balancer — ensures requests route to the same backend server.';
  if (/^ck/.test(name))    return 'Functional preference cookie set by the website (e.g., forum or UI state).';
  if (/^yt-remote-/.test(name)) return 'YouTube — stores user preferences for embedded video playback.';
  if (/^wp-settings/.test(name)) return 'WordPress — stores UI preferences for the logged-in user.';
  if (/^intercom-/.test(name)) return 'Intercom — remembers users for in-app messaging and support chat.';

  return null;
}

// ─── Main categorisation function ──────────────────────────────────────────
function categorizeCookie(cookie) {
  const rawName   = cookie.name || '';
  const nameLower = rawName.toLowerCase();
  const domainRaw = (cookie.domain || '').toLowerCase().replace(/^\./, '');

  // 1. Exact match in knowledge base
  const knownKey = nameLower.replace(/[^a-z0-9_]/g, '_');
  if (KNOWN_COOKIES[knownKey]) return KNOWN_COOKIES[knownKey].category;

  // GA4 property-scoped (_ga_XXXXXXXX) and _gat_UA variants
  if (/^_ga_[a-z0-9]+$/i.test(rawName)) return 'analytics';
  if (/^_gat_/.test(rawName))            return 'analytics';

  // 2. Domain-based overrides
  for (const rule of DOMAIN_RULES) {
    if (rule.match.some(m => domainRaw.includes(m))) {
      // YouTube functional exceptions
      if (['youtube.com','ytimg.com'].some(d => domainRaw.includes(d))) {
        if (['ysc','use_hitbox','visitor_info1_live'].includes(nameLower) ||
            nameLower.startsWith('yt-remote-') || nameLower.startsWith('yt_')) {
          return 'functional';
        }
        return 'social';
      }
      return rule.category;
    }
  }

  // 3. Name-based pattern rules
  for (const rule of NAME_RULES) {
    if (rule.test(nameLower)) return rule.category;
  }

  return 'unclassified';
}

// ─── Cookie description enricher ───────────────────────────────────────────
// Replaces the generic "Generated by domain. Expires in X days" string with
// a meaningful description when the cookie is well-known.
function enrichCookieDescription(cookie, fallback) {
  const description = lookupDescription(cookie.name, cookie.domain);
  return description || fallback;
}

function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}

module.exports = { categorizeCookie, enrichCookieDescription, normalizeUrl };
