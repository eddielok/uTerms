import { supabase } from './supabase';

async function generateNonce(): Promise<[string, string]> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const raw = btoa(String.fromCharCode(...array));
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return [raw, hashed];
}

export async function renderGoogleButton(
  container: HTMLElement,
  onSuccess: () => void,
  onError: (msg: string) => void
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const google = (window as any).google;
  if (!google) {
    onError('Google Sign-In script not loaded.');
    return;
  }

  const [rawNonce, hashedNonce] = await generateNonce();

  google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    nonce: hashedNonce,
    callback: async (response: { credential: string }) => {
      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
          nonce: rawNonce,
        });
        if (error) throw error;
        onSuccess();
      } catch (err: unknown) {
        onError(err instanceof Error ? err.message : 'Google sign-in failed.');
      }
    },
  });

  google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    width: container.offsetWidth || 340,
  });
}
