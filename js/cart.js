/**
 * VELOCE LABS - Cart Module
 * Manages the in-memory cart array, renders cart UI, and exposes
 * add/remove/update actions.
 * Depends on: storage.js, products.js, ui.js
 */

let cart = loadSavedCart();

// ── Cart actions ─────────────────────────────────────────────────────────────

async function addToCart(productId) {
    const numericId = Number(productId);
    if (!Number.isFinite(numericId)) {
        showToast('ERROR: Invalid product selected.');
        return;
    }

    const data = await loadProducts();
    const product = data.find(p => Number(p.id) === numericId)
        || fallbackProducts.find(p => Number(p.id) === numericId);

    if (!product) {
        showToast('ERROR: Product manifest not loaded. Please refresh.');
        return;
    }

    cart = loadSavedCart();

    const existingItem = cart.find(item => Number(item.id) === numericId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Number(product.id),
            name: product.name,
            category: product.category,
            price: Number(product.price) || 0,
            manufacturer: product.manufacturer,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartUI();
    renderCart();
    showToast(`${product.name} added to your cart.`);
}

function removeFromCart(productId) {
    const numericId = Number(productId);
    cart = loadSavedCart().filter(item => Number(item.id) !== numericId);
    saveCart(cart);
    updateCartUI();
    showToast('Item removed from cart.');
}

function updateQuantity(productId, delta) {
    const numericId = Number(productId);
    cart = loadSavedCart();
    const item = cart.find(cartItem => Number(cartItem.id) === numericId);
    if (!item) return;

    item.quantity += Number(delta);
    if (item.quantity <= 0) {
        removeFromCart(numericId);
        return;
    }

    saveCart(cart);
    updateCartUI();
}

function checkout() {
    showToast('SYNC INITIATED. REDIRECTING TO PAYMENT PROTOCOL.');
    setTimeout(() => {
        const inPages = window.location.pathname.includes('/pages/');
        window.location.href = inPages ? 'checkout.html' : 'pages/checkout.html';
    }, 900);
}

// ── Cart UI ───────────────────────────────────────────────────────────────────

function updateCartUI() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.classList.add('pulse');
    setTimeout(() => cartCountElement.classList.remove('pulse'), 500);
}

function renderCart() {
    const container = document.getElementById('cart-content');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart" data-aos="zoom-in">
                <h3>YOUR CART IS EMPTY.</h3>
                <a href="products.html" class="btn btn-primary empty-cart-btn">BACK TO SHOP</a>
            </div>
        `;
        refreshAOS();
        return;
    }

    let subtotal = 0;
    const itemsHTML = cart.map(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        const lineTotal = price * quantity;
        subtotal += lineTotal;

        return `
            <article class="cart-item" data-aos="fade-up">
                <img src="${escapeHTML(fixImagePath(item.image))}" alt="${escapeHTML(item.name)}">
                <div class="item-details">
                    <h3>${escapeHTML(item.name)}</h3>
                    <p class="item-meta">${escapeHTML(item.manufacturer)}</p>
                    <div class="qty-controls">
                        <div class="qty-wrap">
                            <button class="qty-btn" type="button" data-cart-quantity="${Number(item.id)}" data-delta="-1">-</button>
                            <span class="item-qty">${quantity}</span>
                            <button class="qty-btn" type="button" data-cart-quantity="${Number(item.id)}" data-delta="1">+</button>
                        </div>
                        <button class="remove-btn" type="button" data-cart-remove="${Number(item.id)}">Remove</button>
                    </div>
                </div>
                <div class="item-line-total">${lineTotal.toFixed(0)}</div>
            </article>
        `;
    }).join('');

    container.innerHTML = `
        <section class="cart-items">${itemsHTML}</section>
        <aside class="summary" data-aos="fade-left">
            <h3 class="summary-title">Order Summary</h3>
            <div class="summary-row"><span>Subtotal</span><span>INR ${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Shipping</span><span class="shipping-free">FREE</span></div>
            <div class="summary-row summary-total"><span>Total</span><span>INR ${subtotal.toFixed(2)}</span></div>
            <button class="btn btn-primary checkout-btn" type="button" data-checkout>Checkout</button>
        </aside>
    `;
    refreshAOS();
}

// ── Page init ─────────────────────────────────────────────────────────────────

function initCartPage() {
    cart = loadSavedCart();
    updateCartUI();
    renderCart();
}
