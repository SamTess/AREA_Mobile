import * as SecureStore from 'expo-secure-store';

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    OAUTH_STATE: 'oauth_state',
    PKCE_VERIFIER: 'oauth_pkce_verifier',
} as const;

// User data (non sensible)
export async function saveUserData(userJSON: string) {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, userJSON);
}
export async function getUserData(): Promise<string | null> {
    return SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
}

// Optional tokens (non utilisés avec cookies HttpOnly, mais gardés pour futur)
export async function saveAccessToken(token: string) {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
}
export async function getAccessToken() {
    return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
}
export async function saveRefreshToken(token: string) {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
}
export async function getRefreshToken() {
    return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
}

// OAuth temp (state / pkce)
export async function saveOAuthState(value: string) {
    await SecureStore.setItemAsync(STORAGE_KEYS.OAUTH_STATE, value);
}
export async function getOAuthState() {
    return SecureStore.getItemAsync(STORAGE_KEYS.OAUTH_STATE);
}
export async function clearOAuthState() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.OAUTH_STATE);
}

export async function savePkceVerifier(value: string) {
    await SecureStore.setItemAsync(STORAGE_KEYS.PKCE_VERIFIER, value);
}
export async function getPkceVerifier() {
    return SecureStore.getItemAsync(STORAGE_KEYS.PKCE_VERIFIER);
}
export async function clearPkceVerifier() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.PKCE_VERIFIER);
}

export async function clearAuthData() {
    await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
        SecureStore.deleteItemAsync(STORAGE_KEYS.OAUTH_STATE),
        SecureStore.deleteItemAsync(STORAGE_KEYS.PKCE_VERIFIER),
    ]);
}
