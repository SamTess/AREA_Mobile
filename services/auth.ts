import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './api.config';
import {
    saveUserData, clearAuthData, saveOAuthState, clearOAuthState,
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

let oauthInFlight = false;

const handledAuthCodes = new Set<string>();
export function hasHandledCode(code: string) {
    return handledAuthCodes.has(code);
}
export function markHandledCode(code: string) {
    try { handledAuthCodes.add(code); } catch { /* noop */ }
}

async function getMe(): Promise<User | null> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const r = await fetch(buildUrl(API_ENDPOINTS.AUTH.ME), { credentials: 'include' });
            if (!r.ok) {
                console.debug(`getMe attempt ${attempt}: HTTP ${r.status}`);
            } else {
                const user = await r.json();
                return user || null;
            }
        } catch (err) {
            console.debug(`getMe attempt ${attempt}: network error`, err);
        }
        if (attempt < maxAttempts) await new Promise((res) => setTimeout(res, 250 * attempt));
    }
    return null;
}

async function finalizeFromMe(msg: string): Promise<AuthResponse> {
    const me = await getMe();
    if (!me) throw new Error('Failed to load current user');
    await saveUserData(JSON.stringify(me));
    return { message: msg, user: me };
}

async function exchangeCodeAndLoadUser(provider: ProviderKey, code: string): Promise<AuthResponse> {
    const exchangePath =
        provider === 'github'
            ? API_ENDPOINTS.OAUTH.GITHUB_EXCHANGE
            : API_ENDPOINTS.OAUTH.GOOGLE_EXCHANGE;
    const body: Record<string, string> = { code };
    const pkceVerifier = await getPkceVerifier();
    if (pkceVerifier) body.code_verifier = pkceVerifier;

    try {
        if (handledAuthCodes.has(code)) {
            console.warn(`Authorization code already handled for ${provider}, skipping exchange`);
            const me = await getMe();
            if (me) return { message: 'Login completed (already handled)', user: me };
            throw new Error('Authorization code already used');
        }
        const res = await fetch(buildUrl(exchangePath), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        });
        console.debug(`OAuth exchange response for ${provider}: status=${res.status}`);
        if (!res.ok) {
            const me = await getMe();
            console.warn(`OAuth exchange failed for ${provider}, trying /me fallback: me=${me ? 'found' : 'not_found'}`);
            if (me) {
                await clearPkceVerifier(); await clearOAuthState();
                markHandledCode(code);
                await saveUserData(JSON.stringify(me));
                return { message: 'Login completed', user: me };
            }
            const txt = await res.text().catch(() => '');
            throw new Error(txt || `Failed to exchange authorization code (HTTP ${res.status})`);
        }
        await clearPkceVerifier(); await clearOAuthState();
        markHandledCode(code);
        return await finalizeFromMe('Login successful');
    } catch (e: any) {
        console.error('OAuth exchange exception', e);
        const me = await getMe();
        console.warn(`Backend /me after exchange exception: me=${me ? 'found' : 'not_found'}`);
        if (me) {
            await clearPkceVerifier(); await clearOAuthState();
            markHandledCode(code);
            await saveUserData(JSON.stringify(me));
            return { message: 'Login completed (fallback)', user: me };
        }
        throw new Error(e?.message || ERROR_MESSAGES.SERVER);
    }
}

async function oauthLogin(provider: ProviderKey): Promise<AuthResponse> {
    if (oauthInFlight) throw new Error('Login already in progress');
    oauthInFlight = true;
    try {
        const redirectUri = Linking.createURL('oauthredirect');
        const authorizePath =
            provider === 'github'
                ? API_ENDPOINTS.OAUTH.GITHUB_AUTHORIZE
                : API_ENDPOINTS.OAUTH.GOOGLE_AUTHORIZE;
        const params = new URLSearchParams({
            app_redirect_uri: redirectUri,
            returnUrl: '/(tabs)',
        });
        const authorizeUrl = `${buildUrl(authorizePath)}?${params.toString()}`;
        const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri);

        if (result.type !== 'success' || !result.url) {
            const me = await getMe();
            const resultUrl = (result as any)?.url ?? null;
            console.warn(`${provider} openAuthSession result: type=${result.type}, url=${resultUrl}; /me=${me ? 'found' : 'not_found'}`);
            if (me) return { message: 'Login completed', user: me };
            if (result.type === 'cancel' || result.type === 'dismiss') throw new Error(`${provider} login cancelled`);
            throw new Error(`${provider} login failed`);
        }

        const parsed = Linking.parse(result.url);
        console.debug(`OAuth callback parsed for ${provider}: ${JSON.stringify(parsed)}`);
        const code = (parsed as any)?.queryParams?.code as string | undefined;
        const error = (parsed as any)?.queryParams?.error as string | undefined;
        if (error) throw new Error(`OAuth error: ${error}`);
        if (!code) {
            const me = await getMe();
            if (me) return { message: 'Login completed', user: me };
            throw new Error('Missing authorization code');
        }
        return await exchangeCodeAndLoadUser(provider, code);
    } finally {
        oauthInFlight = false;
    }
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
