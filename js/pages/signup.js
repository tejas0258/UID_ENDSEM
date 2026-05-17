/**
 * VELOCE LABS - Signup Page
 * Handles the registration form, validation, and account creation.
 * Depends on: storage.js, auth.js, ui.js
 */

function setSignupMessage(message, type = 'info') {
    const messageElement = document.getElementById('signup-message');
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.remove('auth-message-error', 'auth-message-success');
    if (type === 'error') messageElement.classList.add('auth-message-error');
    if (type === 'success') messageElement.classList.add('auth-message-success');
}

function initSignupPage() {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    if (readSavedUser()) {
        setSignupMessage('You are already logged in. Creating a new account will switch the active profile.', 'success');
    } else {
        setSignupMessage('Create an account to open your VELOCE profile dashboard.');
    }

    signupForm.addEventListener('submit', event => {
        event.preventDefault();
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm');
        const submitButton = signupForm.querySelector('button[type="submit"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmInput ? confirmInput.value : '';

        if (name.length < 2) {
            setSignupMessage('Please enter your full name.', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        if (!isValidEmail(email)) {
            setSignupMessage('Please enter a valid email address.', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (password.length < 4) {
            setSignupMessage('Password must contain at least 4 characters.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            setSignupMessage('Passwords do not match.', 'error');
            if (confirmInput) confirmInput.focus();
            return;
        }

        const created = registerUserAccount({ name, email, password });
        if (!created) {
            setSignupMessage('This email already has an account. Please login instead.', 'error');
            return;
        }

        const user = {
            email: normalizeEmail(email),
            name,
            loginAt: new Date().toISOString(),
            authenticated: true
        };

        saveUser(user);
        updateAuthUI();
        setSignupMessage('Account created successfully. Opening your profile...', 'success');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Opening Profile...';
        }
        showToast('ACCOUNT CREATED. PROFILE UNLOCKED.');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 900);
    });
}
