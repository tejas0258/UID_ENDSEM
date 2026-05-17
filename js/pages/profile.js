/**
 * VELOCE LABS - Profile Page
 * Displays logged-in user info and handles logout redirect.
 * Depends on: storage.js, auth.js, ui.js
 */

function initProfilePage() {
    const emailElement = document.getElementById('profile-email');
    const nameElement = document.getElementById('profile-name');
    const statusElement = document.getElementById('profile-status');
    const cartCountElement = document.getElementById('profile-cart-count');
    const loginAction = document.getElementById('profile-login-action');
    const logoutButton = document.querySelector('[data-logout]');
    const savedUser = readSavedUser();

    if (!savedUser) {
        if (nameElement) nameElement.textContent = 'Guest';
        if (emailElement) emailElement.textContent = 'You are not logged in. Redirecting to login...';
        if (statusElement) statusElement.textContent = 'Locked';
        if (loginAction) loginAction.classList.remove('is-hidden');
        if (logoutButton) logoutButton.classList.add('is-hidden');
        showToast('PLEASE LOGIN TO OPEN YOUR PROFILE.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
        return;
    }

    if (nameElement) nameElement.textContent = savedUser.name || getDisplayNameFromEmail(savedUser.email);
    if (emailElement) emailElement.textContent = `Signed in as ${savedUser.email}`;
    if (statusElement) statusElement.textContent = 'Verified';
    if (loginAction) loginAction.classList.add('is-hidden');
    if (logoutButton) logoutButton.classList.remove('is-hidden');

    if (cartCountElement) {
        const totalItems = loadSavedCart().reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}
