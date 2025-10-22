import * as SecureStoreModule from 'expo-secure-store';

const SecureStore: {
    getItemAsync(key: string): Promise<string | null>;
    setItemAsync(key: string, value: string): Promise<void>;
    deleteItemAsync(key: string): Promise<void>;
} = (() => {
    const mod: any = SecureStoreModule as any;
    const candidate = mod.default ?? mod;

    const getItem = candidate.getItemAsync ?? candidate.getValueWithKeyAsync;
    const setItem = candidate.setItemAsync ?? candidate.setValueWithKeyAsync;
    const deleteItem = candidate.deleteItemAsync ?? candidate.deleteValueWithKeyAsync ?? candidate.removeItemAsync;

    if (!getItem || !setItem || !deleteItem) {
        return {
            getItemAsync: async () => null,
            setItemAsync: async () => {},
            deleteItemAsync: async () => {},
        };
    }

    return {
        getItemAsync: (key: string) => getItem.call(candidate, key),
        setItemAsync: (key: string, value: string) => setItem.call(candidate, key, value),
        deleteItemAsync: (key: string) => deleteItem.call(candidate, key),
    };
})();

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_DATA: 'auth_user_data',
    OAUTH_STATE: 'oauth_state',
    PKCE_VERIFIER: 'oauth_pkce_verifier',
} as const;

export async function saveUserData(userJSON: string) {
    try {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, userJSON);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(STORAGE_KEYS.USER_DATA, userJSON);
                return;
            }
        } catch (e) {
        }
        throw err;
    }
}
export async function getUserData(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(STORAGE_KEYS.USER_DATA);
            }
        } catch (e) {
        }
        return null;
    }
}

export async function saveAccessToken(token: string) {
    try {
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
                return;
            }
        } catch (e) {}
        throw err;
    }
}
export async function getAccessToken() {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            }
        } catch (e) {}
        return null;
    }
}
export async function saveRefreshToken(token: string) {
    try {
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
                return;
            }
        } catch (e) {}
        throw err;
    }
}
export async function getRefreshToken() {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            }
        } catch (e) {}
        return null;
    }
}

export async function saveOAuthState(value: string) {
    try {
        await SecureStore.setItemAsync(STORAGE_KEYS.OAUTH_STATE, value);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(STORAGE_KEYS.OAUTH_STATE, value);
                return;
            }
        } catch (e) {}
        throw err;
    }
}
export async function getOAuthState() {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.OAUTH_STATE);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
            }
        } catch (e) {}
        return null;
    }
}
export async function clearOAuthState() {
    try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.OAUTH_STATE);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
                return;
            }
        } catch (e) {}
        throw err;
    }
}

export async function savePkceVerifier(value: string) {
    try {
        await SecureStore.setItemAsync(STORAGE_KEYS.PKCE_VERIFIER, value);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(STORAGE_KEYS.PKCE_VERIFIER, value);
                return;
            }
        } catch (e) {}
        throw err;
    }
}
export async function getPkceVerifier() {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.PKCE_VERIFIER);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(STORAGE_KEYS.PKCE_VERIFIER);
            }
        } catch (e) {}
        return null;
    }
}
export async function clearPkceVerifier() {
    try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.PKCE_VERIFIER);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(STORAGE_KEYS.PKCE_VERIFIER);
                return;
            }
        } catch (e) {}
        throw err;
    }
}

export async function clearAuthData() {
    try {
        await Promise.all([
            SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
            SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
            SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
            SecureStore.deleteItemAsync(STORAGE_KEYS.OAUTH_STATE),
            SecureStore.deleteItemAsync(STORAGE_KEYS.PKCE_VERIFIER),
        ]);
    } catch (err) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                window.localStorage.removeItem(STORAGE_KEYS.USER_DATA);
                window.localStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
                window.localStorage.removeItem(STORAGE_KEYS.PKCE_VERIFIER);
                return;
            }
        } catch (e) {}
        throw err;
    }
}
