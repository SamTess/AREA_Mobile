import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './api.config';
import {
    saveUserData, getUserData, clearAuthData,
    saveOAuthState, getOAuthState, clearOAuthState,
    savePkceVerifier, getPkceVerifier, clearPkceVerifier,
} from './storage';

WebBrowser.maybeCompleteAuthSession();

export interface User {
    id: string;
    email: string;
    name?: string;
    isActive?: boolean;
    isAdmin?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
    avatarUrl?: string | null;
}

export interface AuthResponse {
    message: string;
    user: User | null;
}

export type ProviderKey = 'github' | 'google';

function assertOk(res: Response, fallbackMsg: string) {
    if (!res.ok) {
        throw new Error(`${fallbackMsg} (HTTP ${res.status})`);
    }
}

function buildUrl(path: string) {
    const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
}

// (PKCE préparé mais désactivé tant que le back ne l’attend pas)
function b64urlFromBytes(bytes: Uint8Array) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function createPkceAndState() {
    const verifierBytes = new Uint8Array(32);
    crypto.getRandomValues(verifierBytes);
    const verifier = b64urlFromBytes(verifierBytes);

    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(verifier));
    const challenge = b64urlFromBytes(new Uint8Array(hash));

    const stateBytes = new Uint8Array(16);
    crypto.getRandomValues(stateBytes);
    const state = b64urlFromBytes(stateBytes);

    await savePkceVerifier(verifier);
    await saveOAuthState(state);
    return { verifier, challenge, state };
}

export async function getCurrentUser(): Promise<User | null> {
    try {
        const res = await fetch(buildUrl(API_ENDPOINTS.AUTH.ME), { credentials: 'include' });
        if (!res.ok) return null;
        const user = (await res.json()) as User;
        return user || null;
    } catch {
        return null;
    }
}

export async function logout(): Promise<void> {
    try {
        await fetch(buildUrl(API_ENDPOINTS.AUTH.LOGOUT), { method: 'POST', credentials: 'include' });
    } finally {
        await clearAuthData();
    }
}

async function exchangeCodeAndLoadUser(provider: ProviderKey, code: string) {
    const exchangePath =
        provider === 'github'
            ? API_ENDPOINTS.OAUTH.GITHUB_EXCHANGE
            : API_ENDPOINTS.OAUTH.GOOGLE_EXCHANGE;

    const body: Record<string, string> = { code };
    const pkceVerifier = await getPkceVerifier();
    if (pkceVerifier) body.code_verifier = pkceVerifier;

    const res = await fetch(buildUrl(exchangePath), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
    });
    assertOk(res, 'Failed to exchange authorization code');

    await clearPkceVerifier();
    await clearOAuthState();

    const me = await getCurrentUser();
    if (!me) throw new Error('Failed to load current user');
    await saveUserData(JSON.stringify(me));
    return { message: 'Login successful', user: me } as AuthResponse;
}

async function oauthLogin(provider: ProviderKey): Promise<AuthResponse> {
    // const { challenge, state } = await createPkceAndState(); // prêt si back PKCE

    // 1) deep link mobile qui recevra le code
    const redirectUri = Linking.createURL('oauthredirect'); // areamobile://oauthredirect

    // 2) URL d’autorisation côté backend + hints pour construire state
    const authorizePath =
        provider === 'github'
            ? API_ENDPOINTS.OAUTH.GITHUB_AUTHORIZE
            : API_ENDPOINTS.OAUTH.GOOGLE_AUTHORIZE;

    // Hints : app_redirect_uri + returnUrl (optionnel)
    const params = new URLSearchParams({
        app_redirect_uri: redirectUri,
        returnUrl: '/(tabs)', // change si tu veux une autre destination par défaut
    });
    const authorizeUrl = `${buildUrl(authorizePath)}?${params.toString()}`;

    // 3) Lance la session OAuth
    const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri);

    if (result.type !== 'success' || !result.url) {
        if (result.type === 'cancel' || result.type === 'dismiss') {
            throw new Error(`${provider} login cancelled`);
        }
        throw new Error(`${provider} login failed`);
    }

    // 4) Parse callback (si le provider redirigeait direct vers app — ici normallement la page web le fait)
    const parsed = Linking.parse(result.url);
    const code = (parsed as any)?.queryParams?.code as string | undefined;
    const error = (parsed as any)?.queryParams?.error as string | undefined;

    if (error) throw new Error(`OAuth error: ${error}`);
    if (!code) {
        // Dans notre design, GitHub redirige vers la page Web, qui ensuite deep link l’app.
        // Certains navigateurs in-app peuvent cependant “forwarder” vers l’app avec ?code, on le gère ici si présent.
        // S’il n’y a pas de code → on attend que la page web ait fait l’exchange (côté browser),
        // puis on récupère /me au prochain lancement. Pour plus de robustesse, on peut aussi écouter Linking.addEventListener dans l’app.
    } else {
        // Si on a reçu le code directement, on peut faire l’exchange côté mobile :
        return exchangeCodeAndLoadUser(provider, code);
    }

    // Fallback : si pas de code, on tente de charger l’utilisateur (cookies déjà posés par le Web après exchange)
    const me = await getCurrentUser();
    if (!me) throw new Error('Authentication did not complete');
    await saveUserData(JSON.stringify(me));
    return { message: 'Login successful', user: me };
}

export async function loginWithGithub(): Promise<AuthResponse> {
    try {
        return await oauthLogin('github');
    } catch (e: any) {
        throw new Error(e?.message || ERROR_MESSAGES.UNKNOWN);
    }
}

export async function loginWithGoogle(): Promise<AuthResponse> {
    try {
        return await oauthLogin('google');
    } catch (e: any) {
        throw new Error(e?.message || ERROR_MESSAGES.UNKNOWN);
    }
}
