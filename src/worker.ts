interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ASSETS: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (response.status === 404) {
      if (url.pathname.startsWith('/assets/')) {
        // Stale chunk from a previous deployment — force the browser to reload
        // so it picks up the new index.html and fresh chunk filenames.
        return new Response(
          '<!doctype html><script>window.location.reload()</script>',
          { status: 200, headers: { 'Content-Type': 'text/html' } },
        );
      }
      // SPA fallback — all other 404s serve index.html so React Router handles routing
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request));
    }

    return response;
  },
};
