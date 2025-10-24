import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage keys
 */
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    COOKIES: 'auth_cookies',
} as const;

/**
 * Saves the access token securely
 */
export async function saveAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
}

/**
 * Retrieves the access token
 */
export async function getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Saves the refresh token securely
 */
export async function saveRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Retrieves the refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Saves user data
 */
export async function saveUserData(userData: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, userData);
}

/**
 * Retrieves user data
 */
export async function getUserData(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
}

/**
 * Saves cookies securely
 */
export async function saveCookies(cookies: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.COOKIES, cookies);
}

/**
 * Retrieves cookies
 */
export async function getCookies(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.COOKIES);
}

/**
 * Deletes all authentication data
 */
export async function clearAuthData(): Promise<void> {
    await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
        SecureStore.deleteItemAsync(STORAGE_KEYS.COOKIES),
    ]);
}
