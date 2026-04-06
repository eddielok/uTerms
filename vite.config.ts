import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

function resourceBlockerPlugin(env: Record<string, string>) {
  return {
    name: 'resource-blocker',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/resource-blocker/')) {
          const splitUrl = req.url.split('?')[0].split('/');
          const userId = splitUrl[splitUrl.length - 1]; // Support `/resource-blocker/[id]`
          
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.end(`
console.log("[uTerms] Initializing live Cookie Banner for user: ${userId}");

(async function() {
  if (localStorage.getItem('uterms_consent')) return; // Already answered

  const SUPABASE_URL = "${env.VITE_SUPABASE_URL}";
  const SUPABASE_KEY = "${env.VITE_SUPABASE_ANON_KEY}";
  
  try {
    const response = await fetch(\`\${SUPABASE_URL}/rest/v1/user_cookie_settings?user_id=eq.\${userId}&select=banner_config\`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });

    const data = await response.json();
    let config = { theme: '#3b82f6', position: 'bottom', styleMode: 'banner' };
    
    if (data && data.length > 0 && data[0].banner_config) {
      config = { ...config, ...data[0].banner_config };
    }

    const bannerId = 'uterms-live-banner-container';
    if (document.getElementById(bannerId)) return;

    const banner = document.createElement('div');
    banner.id = bannerId;
    banner.style.position = 'fixed';
    
    // Position handling
    if (config.position === 'top') { banner.style.top = '0'; } else { banner.style.bottom = '0'; }
    
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.backgroundColor = 'white';
    banner.style.boxShadow = config.position === 'top' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : '0 -4px 6px -1px rgba(0,0,0,0.1)';
    banner.style.padding = '1.25rem 2rem';
    banner.style.zIndex = '2147483647'; // Max z-index
    banner.style.display = 'flex';
    banner.style.justifyContent = 'space-between';
    banner.style.alignItems = 'center';
    banner.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    banner.style.borderTop = config.position === 'bottom' ? '1px solid #e5e7eb' : 'none';
    banner.style.borderBottom = config.position === 'top' ? '1px solid #e5e7eb' : 'none';

    banner.innerHTML = \`
      <div style="flex: 1; max-width: 800px; padding-right: 2rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #111827;">We value your privacy</h3>
        <p style="margin: 0; font-size: 0.875rem; color: #4b5563; line-height: 1.4;">
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <button id="uterms-reject-btn" style="background: none; border: 1px solid #d1d5db; color: #374151; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-weight: 500; font-size: 0.875rem;">Reject All</button>
        <button id="uterms-accept-btn" style="background-color: \${config.theme}; border: \${config.theme === '#ffffff' ? '1px solid #d1d5db' : 'none'}; color: \${config.theme === '#ffffff' ? '#000000' : '#ffffff'}; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; font-weight: 500; font-size: 0.875rem;">Accept All</button>
      </div>
    \`;

    document.body.appendChild(banner);

    document.getElementById('uterms-accept-btn').addEventListener('click', () => {
      document.getElementById(bannerId).remove();
      localStorage.setItem('uterms_consent', 'all');
      console.log('[uTerms] Cookies conditionally loaded');
    });

    document.getElementById('uterms-reject-btn').addEventListener('click', () => {
      document.getElementById(bannerId).remove();
      localStorage.setItem('uterms_consent', 'essential');
      console.log('[uTerms] Only essential cookies loaded');
    });

  } catch (err) {
    console.error('[uTerms] Failed to load cookie banner script', err);
  }
})();
          `);
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), resourceBlockerPlugin(env), cloudflare()],
    test: {
      environment: 'node',
      include: ['src/**/*.test.{ts,tsx}'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-sentry': ['@sentry/react'],
            'vendor-ui': ['lucide-react', 'react-helmet-async', 'dompurify'],
          },
        },
      },
    },
  };
});