/**
 * VELOCE LABS - Product Detail Page
 * Loads and renders a single product, handles spec/dim/desc tabs.
 * Depends on: ui.js, products.js
 */

let currentProduct = null;

function renderSpecsRows(specs) {
    if (!specs || Object.keys(specs).length === 0) {
        return '<tr><td colspan="2" class="specs-empty">TECHNICAL DATA NOT INITIALIZED</td></tr>';
    }

    return Object.entries(specs)
        .map(([key, value]) => `
            <tr>
                <td class="specs-label">${escapeHTML(key)}</td>
                <td>${escapeHTML(value)}</td>
            </tr>
        `)
        .join('');
}

function renderDetailTab(tab) {
    const content = document.getElementById('tab-content');
    if (!content || !currentProduct) return;

    if (tab === 'specs') {
        content.innerHTML = `<table class="specs-table">${renderSpecsRows(currentProduct.specs)}</table>`;
        return;
    }

    if (tab === 'dims') {
        content.innerHTML = `
            <table class="specs-table">
                <tr><td class="specs-label">Dimensions</td><td>${escapeHTML(currentProduct.dimensions || 'NOT SPECIFIED')}</td></tr>
                <tr><td class="specs-label">Mass</td><td>${escapeHTML(currentProduct.weight || 'NOT SPECIFIED')}</td></tr>
            </table>
        `;
        return;
    }

    content.innerHTML = `<p class="desc-text">${escapeHTML(currentProduct.description || currentProduct.shortDescription || 'No detailed description available.')}</p>`;
}

async function initDetailPage() {
    const view = document.getElementById('product-detail-view');
    if (!view) return;

    const id = Number(getUrlParam('id'));
    const data = await loadProducts(getProductsBase());

    if (!data.length) {
        view.innerHTML = loadingHTML('DATABASE SYNC FAILED.');
        return;
    }

    const product = data.find(item => Number(item.id) === id);
    if (!product) {
        view.innerHTML = loadingHTML('COMPONENT NOT FOUND IN GARAGE.');
        return;
    }

    currentProduct = product;
    document.title = `${product.name} | VELOCE`;

    view.innerHTML = `
        <section class="detail-container" data-aos="fade-up">
            <div class="detail-img" data-aos="fade-right" data-aos-delay="100">
                <img src="${escapeHTML(fixImagePath(product.image))}" alt="${escapeHTML(product.name)}">
            </div>
            <div class="detail-info" data-aos="fade-left" data-aos-delay="180">
                <span class="product-category">${escapeHTML(product.category)}</span>
                <h1 class="detail-title">${escapeHTML(product.name)}</h1>
                <p class="detail-maker">By ${escapeHTML(product.manufacturer)}</p>
                <div class="product-price product-price-large">${Number(product.price).toFixed(0)}</div>
                <p class="detail-description">${escapeHTML(product.shortDescription)}</p>
                <button class="btn btn-primary detail-button" type="button" data-add-to-cart="${Number(product.id)}">Add to Cart</button>
            </div>
        </section>

        <section class="tabs" data-aos="fade-up" data-aos-delay="240">
            <div class="tab-headers">
                <button class="tab-btn active" type="button" data-tab="desc">Overview</button>
                <button class="tab-btn" type="button" data-tab="specs">Technical Data</button>
                <button class="tab-btn" type="button" data-tab="dims">Chassis & Weight</button>
            </div>
            <div id="tab-content" class="tab-content"></div>
        </section>
    `;

    renderDetailTab('desc');
    refreshAOS();
}
