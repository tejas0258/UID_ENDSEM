/**
 * VELOCE LABS - Storage Utilities
 * Low-level helpers for reading/writing to localStorage, sessionStorage,
 * window.name, and cookies. Also handles cart and user persistence.
 */

const CART_STORAGE_KEY = 'veloce_cart';
const USER_STORAGE_KEY = 'veloce_user';
const USERS_STORAGE_KEY = 'veloce_users';
const LEGACY_CART_KEYS = ['cart', 'cartItems'];
const CART_WINDOW_NAME_PREFIX = 'VELOCE_CART_DATA:';

// ── Generic storage helpers ──────────────────────────────────────────────────

function readStorageValue(storage, key) {
    try {
        return storage ? storage.getItem(key) : null;
    } catch (error) {
        return null;
    }
}

function writeStorageValue(storage, key, value) {
    try {
        if (storage) storage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}

function removeStorageValue(storage, key) {
    try {
        if (storage) storage.removeItem(key);
    } catch (error) {
        // Some local preview modes block storage access. Ignore safely.
    }
}

// ── window.name fallback ─────────────────────────────────────────────────────

function readCartFromWindowName() {
    try {
        if (!window.name || !window.name.startsWith(CART_WINDOW_NAME_PREFIX)) return null;
        return window.name.slice(CART_WINDOW_NAME_PREFIX.length);
    } catch (error) {
        return null;
    }
}

function writeCartToWindowName(value) {
    try {
        window.name = `${CART_WINDOW_NAME_PREFIX}${value}`;
    } catch (error) {
        // Ignore safely.
    }
}

// ── Cookie fallback ──────────────────────────────────────────────────────────

function readCartFromCookie() {
    try {
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${CART_STORAGE_KEY}=`));
        return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
    } catch (error) {
        return null;
    }
}

function writeCartToCookie(value) {
    try {
        document.cookie = `${CART_STORAGE_KEY}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
    } catch (error) {
        // Cookies may be unavailable on local file preview. Ignore safely.
    }
}

function clearCartCookie() {
    try {
        document.cookie = `${CART_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    } catch (error) {
        // Ignore safely.
    }
}

// ── Cart persistence ─────────────────────────────────────────────────────────

function normalizeCartItems(items) {
    if (!Array.isArray(items)) return [];

    return items
        .map(item => ({
            ...item,
            id: Number(item.id),
            price: Number(item.price) || 0,
            quantity: Math.max(1, Number(item.quantity) || 1)
        }))
        .filter(item => Number.isFinite(item.id));
}

function parseSavedCart(rawValue) {
    if (!rawValue) return [];
    try {
        return normalizeCartItems(JSON.parse(rawValue));
    } catch (error) {
        return [];
    }
}

function loadSavedCart() {
    const keysToTry = [CART_STORAGE_KEY, ...LEGACY_CART_KEYS];
    const storageSources = [window.localStorage, window.sessionStorage];

    for (const storage of storageSources) {
        for (const key of keysToTry) {
            const parsed = parseSavedCart(readStorageValue(storage, key));
            if (parsed.length) return parsed;
        }
    }

    const windowCart = parseSavedCart(readCartFromWindowName());
    if (windowCart.length) return windowCart;

    const cookieCart = parseSavedCart(readCartFromCookie());
    if (cookieCart.length) return cookieCart;

    return [];
}

function saveCart(cart) {
    const payload = JSON.stringify(normalizeCartItems(cart));
    writeStorageValue(window.localStorage, CART_STORAGE_KEY, payload);
    writeStorageValue(window.sessionStorage, CART_STORAGE_KEY, payload);
    writeCartToWindowName(payload);
    writeCartToCookie(payload);
}

function clearSavedCart() {
    removeStorageValue(window.localStorage, CART_STORAGE_KEY);
    removeStorageValue(window.sessionStorage, CART_STORAGE_KEY);
    LEGACY_CART_KEYS.forEach(key => {
        removeStorageValue(window.localStorage, key);
        removeStorageValue(window.sessionStorage, key);
    });
    writeCartToWindowName('[]');
    clearCartCookie();
}

// ── User persistence ─────────────────────────────────────────────────────────

function readSavedUser() {
    const sources = [window.localStorage, window.sessionStorage];

    for (const storage of sources) {
        try {
            const rawUser = storage ? storage.getItem(USER_STORAGE_KEY) : null;
            if (!rawUser) continue;

            const user = JSON.parse(rawUser);
            if (user && user.email) return user;
        } catch (error) {
            // Ignore blocked storage or invalid saved data.
        }
    }

    return null;
}

function saveUser(user) {
    const payload = JSON.stringify(user);
    writeStorageValue(window.localStorage, USER_STORAGE_KEY, payload);
    writeStorageValue(window.sessionStorage, USER_STORAGE_KEY, payload);
}

function clearSavedUser() {
    removeStorageValue(window.localStorage, USER_STORAGE_KEY);
    removeStorageValue(window.sessionStorage, USER_STORAGE_KEY);
}
