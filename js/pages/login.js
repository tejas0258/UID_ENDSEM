/**
 * VELOCE LABS - Login Page
 * Handles the login form, validation, and session creation.
 * Depends on: storage.js, auth.js, ui.js
 */

function setLoginMessage(message, type = 'info') {
    const messageElement = document.getElementById('login-message');
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.remove('auth-message-error', 'auth-message-success');
    if (type === 'error') messageElement.classList.add('auth-message-error');
    if (type === 'success') messageElement.classList.add('auth-message-success');
}

function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const existingUser = readSavedUser();
    if (existingUser) {
        setLoginMessage(`Already signed in as ${existingUser.email}. Submit again to switch account.`, 'success');
    } else {
        setLoginMessage('Login with your signed-up account, or use the demo login.');
    }

    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!isValidEmail(email)) {
            setLoginMessage('Please enter a valid email address.', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (password.length < 4) {
            setLoginMessage('Password must contain at least 4 characters.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        const account = findRegisteredUser(email);
        if (!account) {
            setLoginMessage('No account found. Please create an account from the signup page first.', 'error');
            return;
        }

        if (account.password !== password) {
            setLoginMessage('Incorrect password. Please try again.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        const user = {
            email: account.email,
            name: account.name || getDisplayNameFromEmail(account.email),
            loginAt: new Date().toISOString(),
            authenticated: true
        };

        saveUser(user);
        updateAuthUI();
        setLoginMessage('Login successful. Opening your profile...', 'success');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Opening Profile...';
        }
        showToast('AUTHENTICATION SUCCESSFUL. SYNCING PROFILE.');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 900);
    });
}
