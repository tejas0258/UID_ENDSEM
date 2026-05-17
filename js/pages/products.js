/**
 * VELOCE LABS - Products Page
 * Handles category filters and renders the product grid.
 * Depends on: ui.js, products.js
 */

async function displayProducts(filter = 'all') {
    const productList = document.getElementById('product-list');
    const itemCount = document.getElementById('item-count');
    const pageTitle = document.getElementById('page-title');
    if (!productList || !itemCount) return;

    productList.innerHTML = loadingHTML('LOADING COMPONENTS...');
    const data = await loadProducts(getProductsBase());

    if (!data.length) {
        productList.innerHTML = loadingHTML('No components found in manifest.');
        itemCount.textContent = '0 ITEMS FOUND';
        return;
    }

    const filtered = filter === 'all' ? data : data.filter(product => product.category === filter);
    itemCount.textContent = `${filtered.length} ITEMS FOUND`;

    if (pageTitle) {
        pageTitle.innerHTML = filter === 'all'
            ? 'PRODUCT <span>SHOP</span>'
            : `${escapeHTML(filter.toUpperCase())} <span>SHOP</span>`;
    }

    if (!filtered.length) {
        productList.innerHTML = loadingHTML('No components found in this category.');
        return;
    }

    productList.innerHTML = filtered.map(product => productCardHTML(product)).join('');
    refreshAOS();
}

async function initProductsPage() {
    const filters = Array.from(document.querySelectorAll('#category-filters input[name="category"]'));
    if (!filters.length) return;

    const urlCategory = getUrlParam('cat') || 'all';
    const matchingFilter = filters.find(input => input.value === urlCategory);
    const initialCategory = matchingFilter ? urlCategory : 'all';

    filters.forEach(input => {
        input.checked = input.value === initialCategory;
        input.addEventListener('change', event => {
            if (event.target.checked) displayProducts(event.target.value);
        });
    });

    await displayProducts(initialCategory);
}
