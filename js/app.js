/**
 * Script load order in HTML:
 *   1. ui.js
 *   2. storage.js
 *   3. auth.js
 *   4. products.js
 *   5. cart.js
 *   6. pages/home.js        (index.html only)
 *   7. pages/products.js    (products.html only)
 *   8. pages/product-detail.js (product-detail.html only)
 *   9. pages/login.js       (login.html only)
 *  10. pages/signup.js      (signup.html only)
 *  11. pages/profile.js     (profile.html only)
 *  12. app.js               (every page, last)
 */


function handleGlobalClicks(event) {
    // Demo login autofill
    const demoLoginLink = event.target.closest('[data-fill-demo-login]');
    if (demoLoginLink) {
        event.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        if (emailInput) emailInput.value = 'builder@veloce.systems';
        if (passwordInput) passwordInput.value = '1234';
        setLoginMessage('Demo login filled. Press Authenticate.', 'success');
        return;
    }

    // Logout via nav auth link
    const authLink = event.target.closest('[data-auth-link]');
    if (authLink && readSavedUser()) {
        event.preventDefault();
        clearSavedUser();
        updateAuthUI();
        showToast('PROFILE SESSION CLOSED.');
        if (document.body.dataset.page === 'profile') {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 900);
        }
        return;
    }

    // Add to cart
    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) {
        event.preventDefault();
        addToCart(addButton.dataset.addToCart);
        return;
    }

    // Cart quantity change
    const quantityButton = event.target.closest('[data-cart-quantity]');
    if (quantityButton) {
        updateQuantity(quantityButton.dataset.cartQuantity, quantityButton.dataset.delta);
        renderCart();
        return;
    }

    // Remove from cart
    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) {
        removeFromCart(removeButton.dataset.cartRemove);
        renderCart();
        return;
    }

    // Checkout
    const checkoutButton = event.target.closest('[data-checkout]');
    if (checkoutButton) {
        checkout();
        return;
    }

    // Profile logout button
    const logoutButton = event.target.closest('[data-logout]');
    if (logoutButton) {
        clearSavedUser();
        updateAuthUI();
        showToast('PROFILE SESSION CLOSED.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 900);
        return;
    }

    // Product detail tabs
    const tabButton = event.target.closest('[data-tab]');
    if (tabButton) {
        document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));
        tabButton.classList.add('active');
        renderDetailTab(tabButton.dataset.tab);
    }
}

// ── Page router ───────────────────────────────────────────────────────────────

async function initPageLogic() {
    const page = document.body.dataset.page;

    if (page === 'home')     await initHomePage();
    if (page === 'products') await initProductsPage();
    if (page === 'detail')   await initDetailPage();
    if (page === 'cart')     initCartPage();
    if (page === 'login')    initLoginPage();
    if (page === 'signup')   initSignupPage();
    if (page === 'profile')  initProfilePage();

    refreshAOS();
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function initApp() {
    cart = loadSavedCart();
    updateCartUI();
    initTheme();
    initAOS();
    updateAuthUI();
    document.addEventListener('click', handleGlobalClicks);
    initPageLogic();
}

// ── Cross-tab cart sync ───────────────────────────────────────────────────────

window.addEventListener('storage', event => {
    if (event.key === CART_STORAGE_KEY) {
        cart = loadSavedCart();
        updateCartUI();
        renderCart();
    }
});

// ── Expose globals (for inline onclick attributes if any) ─────────────────────
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.renderCart = renderCart;

document.addEventListener('DOMContentLoaded', initApp);
