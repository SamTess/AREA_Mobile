import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Button } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { API_CONFIG, API_ENDPOINTS } from '../services/api.config';
import { getCurrentUser, logout } from '../services/auth';
import { saveUserData } from '../services/storage';

type Provider = 'github' | 'google';

async function tryFetchMe() {
  try {
    const meRes = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!meRes.ok) return null;
    const me = await meRes.json();
    return me ?? null;
  } catch {
    return null;
  }
}

export default function OAuthRedirect() {
  const params = useLocalSearchParams<{
    code?: string;
    provider?: string;
    error?: string;
    error_description?: string;
  }>();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Completing authentication…');
  const [debug, setDebug] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const code = (params.code ?? '').toString();
      const providerParam = (params.provider ?? 'github').toString().toLowerCase();
      const provider: Provider = providerParam === 'google' ? 'google' : 'github';

      const err = params.error?.toString();
      const errDesc = params.error_description?.toString();

      // Provider-level error
      if (err) {
        setStatus('error');
        setMessage(errDesc || err || 'OAuth authentication failed');
        return;
      }

      // No code? Maybe cookies are already set → try /me
      if (!code) {
        const me = await tryFetchMe();
        if (me) {
          await saveUserData(JSON.stringify(me));
          setStatus('success');
          setMessage('Already authenticated. Redirecting…');
          setTimeout(() => router.replace('/'), 600);
          return;
        }
        setStatus('error');
        setMessage('No authorization code received.');
        return;
      }

      // Attempt the exchange
      try {
        const exchangePath =
          provider === 'github' ? API_ENDPOINTS.OAUTH.GITHUB_EXCHANGE : API_ENDPOINTS.OAUTH.GOOGLE_EXCHANGE;

        const res = await fetch(`${API_CONFIG.BASE_URL}${exchangePath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          // Android sometimes shows 500 even though cookies are set server-side.
          // Fallback: check /me right away; if authenticated, we proceed.
          const text = await res.text().catch(() => '');
          setDebug(`Exchange HTTP ${res.status} ${text || ''}`.trim());

          const me = await tryFetchMe();
          if (me) {
            await saveUserData(JSON.stringify(me));
            setStatus('success');
            setMessage('Authentication completed. Redirecting…');
            setTimeout(() => router.replace('/'), 600);
            return;
          }

          throw new Error(text || `Exchange failed (HTTP ${res.status})`);
        }

        // Normal path: exchange OK → load user
        const me = await tryFetchMe();
        if (!me) throw new Error('Failed to load current user after exchange');

        await saveUserData(JSON.stringify(me));
        setStatus('success');
        setMessage('Authentication successful! Redirecting…');
        setTimeout(() => router.replace('/'), 800);
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'Server error during authentication');
        setDebug(String(e));
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code, params.provider, params.error]);

  return (
    <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      {status === 'processing' && <ActivityIndicator size="large" />}
      <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
        {status === 'processing' && 'Authentication in progress…'}
        {status === 'success' && 'Authentication successful'}
        {status === 'error' && 'Authentication error'}
      </Text>
      <Text style={{ textAlign: 'center' }}>{message}</Text>

      {status === 'error' && (
        <>
          <Button title="Try again" onPress={() => router.replace('/')} />
          <Button
            title="Logout & retry"
            onPress={async () => {
              try { await logout(); } catch {}
              router.replace('/');
            }}
          />
          {debug ? (
            <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{debug}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}
