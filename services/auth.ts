import { User } from '@/types/auth';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './api.config';
import { clearAuthData, saveUserData } from './storage';

WebBrowser.maybeCompleteAuthSession();

const OAUTH_ENDPOINTS = {
	github: {
		authorize: API_ENDPOINTS.OAUTH.GITHUB_AUTHORIZE,
		exchange: API_ENDPOINTS.OAUTH.GITHUB_EXCHANGE,
	},
	google: {
		authorize: API_ENDPOINTS.OAUTH.GOOGLE_AUTHORIZE,
		exchange: API_ENDPOINTS.OAUTH.GOOGLE_EXCHANGE,
	},
	microsoft: {
		authorize: API_ENDPOINTS.OAUTH.MICROSOFT_AUTHORIZE,
		exchange: API_ENDPOINTS.OAUTH.MICROSOFT_EXCHANGE,
	},
} as const;

export type OAuthProvider = keyof typeof OAUTH_ENDPOINTS;

type OAuthSuccess = { message: string; user: User };

const TAB_RETURN_URL = '/(tabs)';

const handledCodes = new Set<string>();

function markCodeHandled(code?: string | null) {
	if (!code) return;
	handledCodes.add(code);
}

function isCodeHandled(code?: string | null) {
	if (!code) return false;
	return handledCodes.has(code);
}

function buildUrl(path: string): string {
	const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
	const finalPath = path.startsWith('/') ? path : `/${path}`;
	return `${base}${finalPath}`;
}

function normaliseProvider(value?: string | null): OAuthProvider | null {
	if (!value) return null;
	const key = value.toLowerCase() as OAuthProvider;
	return key in OAUTH_ENDPOINTS ? key : null;
}

function readParam(input?: string | string[] | null): string | undefined {
	if (!input) return undefined;
	if (Array.isArray(input)) return input[0];
	return input;
}

async function persistUser(user: User) {
	await saveUserData(JSON.stringify(user));
}

async function fetchMe(): Promise<User | null> {
	try {
		const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.ME), {
			credentials: 'include',
		});
		if (!response.ok) return null;
		const data = await response.json().catch(() => null);
		if (!data) return null;
		if (typeof (data as any)?.user === 'object' && (data as any).user) {
			return (data as any).user as User;
		}
		return data as User;
	} catch (error) {
		return null;
	}
}

async function ensureExistingSession(message: string): Promise<OAuthSuccess> {
	const user = await fetchMe();
	if (!user) {
		throw new Error('Authentication session not found');
	}
	await persistUser(user);
	return { message, user };
}

async function exchangeCode(provider: OAuthProvider, code: string): Promise<OAuthSuccess> {
	const endpoint = OAUTH_ENDPOINTS[provider].exchange;
	const MAX_ATTEMPTS = 3;
	let lastErrorMessage: string | null = null;

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
		try {
			const response = await fetch(buildUrl(endpoint), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ code }),
			});

			if (!response.ok) {
				const fallback = await fetchMe();
				if (fallback) {
					await persistUser(fallback);
					markCodeHandled(code);
					return { message: 'Authentication completed', user: fallback };
				}

				lastErrorMessage = await response.text().catch(() => '')
					|| `Failed to exchange authorization code (HTTP ${response.status})`;
			} else {
				const user = await fetchMe();
				if (user) {
					await persistUser(user);
					markCodeHandled(code);
					return { message: 'Authentication successful', user };
				}
				lastErrorMessage = 'Failed to load current user after exchange';
			}
		} catch (error) {
			const fallback = await fetchMe();
			if (fallback) {
				await persistUser(fallback);
				markCodeHandled(code);
				return { message: 'Authentication completed (fallback)', user: fallback };
			}
			lastErrorMessage = ERROR_MESSAGES.SERVER;
		}

		if (attempt < MAX_ATTEMPTS) {
			await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
			continue;
		}
	}

	throw new Error(lastErrorMessage ?? ERROR_MESSAGES.UNKNOWN);
}

export async function getCurrentUser(): Promise<User | null> {
	return fetchMe();
}

export async function loginWithOAuth(provider: OAuthProvider): Promise<OAuthSuccess> {
	const providerConfig = OAUTH_ENDPOINTS[provider];
	const redirectUri = Linking.createURL('oauthredirect');
	const authorizeUrl = new URL(buildUrl(providerConfig.authorize));
	authorizeUrl.searchParams.set('app_redirect_uri', redirectUri);
	authorizeUrl.searchParams.set('returnUrl', TAB_RETURN_URL);

	const result = await WebBrowser.openAuthSessionAsync(authorizeUrl.toString(), redirectUri);
	const resultUrl = 'url' in result ? (result as any).url : null;

	if (result.type !== 'success' || !result.url) {
		const fallback = await fetchMe();
		if (fallback) {
			await persistUser(fallback);
			return { message: 'Authentication completed', user: fallback };
		}

		if (result.type === 'cancel' || result.type === 'dismiss') {
			throw new Error(`${provider} login cancelled`);
		}

		throw new Error(`${provider} login failed`);
	}

	const parsed = Linking.parse(result.url);
	const query = parsed?.queryParams ?? {};

	const paramProvider = normaliseProvider(readParam(query.provider));
	const providerToUse = paramProvider ?? provider;
	const code = readParam(query.code);
	const error = readParam(query.error);
	const errorDescription = readParam((query as any).error_description);

	if (error) {
		throw new Error(errorDescription || error || 'OAuth authorization failed');
	}

	if (!code) {
		return ensureExistingSession('Authentication already completed');
	}

	if (isCodeHandled(code)) {
		return ensureExistingSession('Authentication already completed');
	}

	return exchangeCode(providerToUse, code);
}

export async function completeOAuthRedirect(params: {
	provider?: string | string[];
	code?: string | string[];
	error?: string | string[];
	error_description?: string | string[];
}): Promise<OAuthSuccess> {
	const providerParam = normaliseProvider(readParam(params.provider)) ?? 'github';
	const code = readParam(params.code);
	const error = readParam(params.error);
	const errorDescription = readParam(params.error_description);

	if (error) {
		throw new Error(errorDescription || error || 'OAuth authentication failed');
	}

	if (!code) {
		return ensureExistingSession('Authentication already completed');
	}

	if (isCodeHandled(code)) {
		return ensureExistingSession('Authentication already completed');
	}

	return exchangeCode(providerParam, code);
}

export async function logout(): Promise<void> {
	try {
		await fetch(buildUrl(API_ENDPOINTS.AUTH.LOGOUT), {
			method: 'POST',
			credentials: 'include',
		});
	} finally {
		await clearAuthData();
	}
}

export async function forgotPassword(email: string): Promise<{ message: string }>
{
	const response = await fetch(buildUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email }),
	});
	if (!response.ok) {
		const txt = await response.text().catch(() => '');
		throw new Error(txt || 'Failed to send password reset');
	}
	const data = await response.json().catch(() => ({ message: 'OK' }));
	return data as { message: string };
}

