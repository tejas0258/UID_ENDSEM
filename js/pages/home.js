/**
 * VELOCE LABS - Home Page
 * Renders featured products on the landing page.
 * Depends on: ui.js, products.js
 */

async function initHomePage() {
    const featuredGrid = document.getElementById('featured-products');
    if (!featuredGrid) return;

    featuredGrid.innerHTML = loadingHTML();
    const data = await loadProducts(getProductsBase());

    if (!data.length) {
        featuredGrid.innerHTML = loadingHTML('No products found.');
        return;
    }

    featuredGrid.innerHTML = data
        .slice(0, 4)
        .map(product => productCardHTML(product, 'pages/product-detail.html'))
        .join('');
    refreshAOS();
}
