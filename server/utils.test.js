const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { categorizeCookie, normalizeUrl } = require('./utils');

describe('categorizeCookie', () => {
  describe('analytics', () => {
    it('classifies _ga cookie', () => {
      assert.equal(categorizeCookie({ name: '_ga' }), 'analytics');
    });
    it('classifies _gid cookie', () => {
      assert.equal(categorizeCookie({ name: '_gid' }), 'analytics');
    });
    it('classifies _hjid (Hotjar) cookie', () => {
      assert.equal(categorizeCookie({ name: '_hjid' }), 'analytics');
    });
    it('classifies cookie containing "analytics"', () => {
      assert.equal(categorizeCookie({ name: 'site_analytics_v2' }), 'analytics');
    });
    it('classifies mixpanel cookie', () => {
      assert.equal(categorizeCookie({ name: 'mp_mixpanel_123' }), 'analytics');
    });
  });

  describe('marketing', () => {
    it('classifies _fbp (Facebook Pixel)', () => {
      assert.equal(categorizeCookie({ name: '_fbp' }), 'marketing');
    });
    it('classifies _gcl_au (Google Ads)', () => {
      assert.equal(categorizeCookie({ name: '_gcl_au' }), 'marketing');
    });
    it('classifies cookie containing "ads"', () => {
      assert.equal(categorizeCookie({ name: 'google_ads_id' }), 'marketing');
    });
    it('classifies cookie containing "pixel"', () => {
      assert.equal(categorizeCookie({ name: 'tracking_pixel' }), 'marketing');
    });
  });

  describe('essential', () => {
    it('classifies csrf token', () => {
      assert.equal(categorizeCookie({ name: 'csrf_token' }), 'essential');
    });
    it('classifies session cookie', () => {
      assert.equal(categorizeCookie({ name: 'session_id' }), 'essential');
    });
    it('classifies auth cookie', () => {
      assert.equal(categorizeCookie({ name: 'auth_user' }), 'essential');
    });
    it('classifies __stripe_mid', () => {
      assert.equal(categorizeCookie({ name: '__stripe_mid' }), 'essential');
    });
    it('classifies access_token', () => {
      assert.equal(categorizeCookie({ name: 'access_token' }), 'essential');
    });
  });

  describe('functional', () => {
    it('classifies language cookie', () => {
      assert.equal(categorizeCookie({ name: 'lang' }), 'functional');
    });
    it('classifies __cf_bm (Cloudflare)', () => {
      assert.equal(categorizeCookie({ name: '__cf_bm' }), 'functional');
    });
    it('classifies cf_clearance', () => {
      assert.equal(categorizeCookie({ name: 'cf_clearance' }), 'functional');
    });
    it('classifies cookie_notice_accepted', () => {
      assert.equal(categorizeCookie({ name: 'cookie_notice_accepted' }), 'functional');
    });
    it('classifies consent cookie', () => {
      assert.equal(categorizeCookie({ name: 'gdpr_consent' }), 'functional');
    });
  });

  describe('unclassified', () => {
    it('classifies unknown cookie as unclassified', () => {
      assert.equal(categorizeCookie({ name: 'xyz_random_unknown' }), 'unclassified');
    });
    it('classifies empty name as unclassified', () => {
      assert.equal(categorizeCookie({ name: '' }), 'unclassified');
    });
  });

  it('is case-insensitive', () => {
    assert.equal(categorizeCookie({ name: '_GA' }), 'analytics');
    assert.equal(categorizeCookie({ name: 'CSRF_TOKEN' }), 'essential');
  });
});

describe('normalizeUrl', () => {
  it('adds https:// when no scheme is present', () => {
    assert.equal(normalizeUrl('example.com'), 'https://example.com');
  });
  it('leaves https:// URLs unchanged', () => {
    assert.equal(normalizeUrl('https://example.com'), 'https://example.com');
  });
  it('leaves http:// URLs unchanged', () => {
    assert.equal(normalizeUrl('http://example.com'), 'http://example.com');
  });
  it('adds https:// to URLs with subdomain', () => {
    assert.equal(normalizeUrl('www.example.com/path'), 'https://www.example.com/path');
  });
});
