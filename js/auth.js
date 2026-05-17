/**
 * VELOCE LABS - Auth Module
 * Handles user registration, account lookup, and auth-related UI updates.
 * Depends on: storage.js
 */

const DEFAULT_DEMO_USERS = [
    {
        name: 'Veloce Builder',
        email: 'builder@veloce.systems',
        password: '1234',
        createdAt: 'demo-account',
        isDemo: true
    }
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function getDisplayNameFromEmail(email) {
    const prefix = String(email || '').split('@')[0] || 'Builder';
    return prefix
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ') || 'Builder';
}

// ── Registered user store ─────────────────────────────────────────────────────

function normalizeRegisteredUsers(users) {
    if (!Array.isArray(users)) return [];

    return users
        .map(user => ({
            name: String(user.name || getDisplayNameFromEmail(user.email)).trim(),
            email: normalizeEmail(user.email),
            password: String(user.password || ''),
            createdAt: user.createdAt || new Date().toISOString(),
            isDemo: Boolean(user.isDemo)
        }))
        .filter(user => isValidEmail(user.email) && user.password.length >= 4);
}

function readStoredRegisteredUsers() {
    const sources = [window.localStorage, window.sessionStorage];

    for (const storage of sources) {
        try {
            const rawUsers = storage ? storage.getItem(USERS_STORAGE_KEY) : null;
            if (!rawUsers) continue;

            const parsedUsers = normalizeRegisteredUsers(JSON.parse(rawUsers));
            if (parsedUsers.length) return parsedUsers;
        } catch (error) {
            // Ignore blocked storage or invalid saved accounts.
        }
    }

    return [];
}

function saveStoredRegisteredUsers(users) {
    const cleanUsers = normalizeRegisteredUsers(users).filter(user => !user.isDemo);
    const payload = JSON.stringify(cleanUsers);
    writeStorageValue(window.localStorage, USERS_STORAGE_KEY, payload);
    writeStorageValue(window.sessionStorage, USERS_STORAGE_KEY, payload);
}

function readRegisteredUsers() {
    const merged = [...DEFAULT_DEMO_USERS, ...readStoredRegisteredUsers()];
    const byEmail = new Map();

    merged.forEach(user => {
        const email = normalizeEmail(user.email);
        if (!byEmail.has(email)) byEmail.set(email, { ...user, email });
    });

    return Array.from(byEmail.values());
}

function findRegisteredUser(email) {
    const targetEmail = normalizeEmail(email);
    return readRegisteredUsers().find(user => user.email === targetEmail) || null;
}

function registerUserAccount(account) {
    const email = normalizeEmail(account.email);
    if (findRegisteredUser(email)) return false;

    const storedUsers = readStoredRegisteredUsers();
    storedUsers.push({
        name: String(account.name || getDisplayNameFromEmail(email)).trim(),
        email,
        password: String(account.password || ''),
        createdAt: new Date().toISOString(),
        isDemo: false
    });
    saveStoredRegisteredUsers(storedUsers);
    return true;
}

// ── Auth UI ───────────────────────────────────────────────────────────────────

function updateAuthUI() {
    const user = readSavedUser();
    const inPagesFolder = window.location.pathname.includes('/pages/');

    document.querySelectorAll('[data-auth-link]').forEach(link => {
        if (user) {
            link.textContent = 'Logout';
            link.setAttribute('href', '#');
            link.setAttribute('aria-label', 'Logout from VELOCE Labs');
        } else {
            link.textContent = 'Login';
            link.setAttribute('href', inPagesFolder ? 'login.html' : 'pages/login.html');
            link.setAttribute('aria-label', 'Login to VELOCE Labs');
        }
    });

    document.querySelectorAll('[data-signup-link]').forEach(link => {
        const wrapper = link.closest('li') || link;
        if (user) {
            wrapper.classList.add('is-hidden');
        } else {
            wrapper.classList.remove('is-hidden');
            link.setAttribute('href', inPagesFolder ? 'signup.html' : 'pages/signup.html');
        }
    });
}
