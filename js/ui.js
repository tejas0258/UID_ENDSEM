/**
 * VELOCE LABS - UI Utilities
 * Shared helpers: HTML escaping, image path fixing, URL params,
 * toast notifications, AOS wrappers, theme toggle, and product card HTML.
 * Depends on: nothing (pure utilities)
 */

// ── String / path helpers ─────────────────────────────────────────────────────

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function fixImagePath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const inPagesFolder = window.location.pathname.includes('/pages/');
    if (inPagesFolder && path.startsWith('assets/')) return '../' + path;
    return path;
}

function getUrlParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

function getProductsBase() {
    return document.body.dataset.productsBase || (window.location.pathname.includes('/pages/') ? '../' : './');
}

// ── Toast notification ────────────────────────────────────────────────────────

function showToast(message) {
    const existing = document.querySelector('.v-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'v-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('is-hiding');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ── AOS wrappers ──────────────────────────────────────────────────────────────

function initAOS() {
    if (!window.AOS) return;

    window.AOS.init({
        duration: 850,
        easing: 'ease-out-cubic',
        once: true,
        offset: 80
    });
}

function refreshAOS() {
    if (!window.AOS) return;
    window.AOS.refreshHard();
}

// ── Theme toggle ──────────────────────────────────────────────────────────────

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle-input');
    const savedTheme = localStorage.getItem('veloce_theme');

    if (savedTheme === 'neon') {
        document.body.classList.add('theme-neon');
        if (themeToggle) themeToggle.checked = true;
    }

    if (!themeToggle) return;

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('theme-neon');
            localStorage.setItem('veloce_theme', 'neon');
            showToast('Switching to NEON RACING BLUE');
        } else {
            document.body.classList.remove('theme-neon');
            localStorage.setItem('veloce_theme', 'classic');
            showToast('Switching to CLASSIC BUGATTI BLUE');
        }
    });
}

// ── Product card HTML ─────────────────────────────────────────────────────────

function loadingHTML(message = 'SYNCING INVENTORY...') {
    return `<div class="state-message">${escapeHTML(message)}</div>`;
}

function productCardHTML(product, detailPath = 'product-detail.html') {
    const id = Number(product.id);
    const detailUrl = `${detailPath}?id=${encodeURIComponent(id)}`;

    return `
        <article class="product-card" data-aos="fade-up">
            <a href="${detailUrl}" class="product-image-link">
                <img src="${escapeHTML(fixImagePath(product.image))}" alt="${escapeHTML(product.name)}">
            </a>
            <div class="product-info">
                <span class="product-category">${escapeHTML(product.category)}</span>
                <a href="${detailUrl}" class="product-title-link">${escapeHTML(product.name)}</a>
                <div class="product-price">${Number(product.price).toFixed(0)}</div>
                <button class="btn btn-primary btn-full" type="button" data-add-to-cart="${id}">Add to Cart</button>
            </div>
        </article>
    `;
}
