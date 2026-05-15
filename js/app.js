// ==============================
// VELOCE LABS - Main JavaScript
// ==============================

async function loadProducts(basePath = "./") {
    const cleanBasePath = basePath.endsWith("/") ? basePath : basePath + "/";

    const possiblePaths = [
        `${cleanBasePath}products.json`,
        `${cleanBasePath}data/products.json`,
        "products.json",
        "data/products.json",
        "../products.json",
        "../data/products.json"
    ];

    for (const path of possiblePaths) {
        try {
            const response = await fetch(path);

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            // Try the next possible path
        }
    }

    console.error("Could not load products.json");
    return [];
}

function fixImagePath(imagePath) {
    if (!imagePath) return "";

    if (
        imagePath.startsWith("http") ||
        imagePath.startsWith("data:") ||
        imagePath.startsWith("/") ||
        imagePath.startsWith("../")
    ) {
        return imagePath;
    }

    const isInsidePagesFolder = window.location.pathname.includes("/pages/");

    if (isInsidePagesFolder) {
        return `../${imagePath}`;
    }

    return imagePath;
}

function getCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length > 0 && typeof cart[0] === "number") {
        cart = cart.map(id => ({
            id: id,
            quantity: 1
        }));

        saveCart(cart);
    }

    return cart;
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
    const cart = getCart();
    const existingProduct = cart.find(item => Number(item.id) === Number(productId));

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: Number(productId),
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();
    animateCartCount();
}

function updateCartCount() {
    const cart = getCart();

    const totalItems = cart.reduce((total, item) => {
        return total + Number(item.quantity || 1);
    }, 0);

    const cartCountElements = document.querySelectorAll(".cart-count");

    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function animateCartCount() {
    const cartCountElements = document.querySelectorAll(".cart-count");

    cartCountElements.forEach(element => {
        element.classList.add("cart-count-pop");

        setTimeout(() => {
            element.classList.remove("cart-count-pop");
        }, 300);
    });
}

function formatPrice(price) {
    const numberPrice = Number(price);

    if (Number.isNaN(numberPrice)) {
        return price;
    }

    return numberPrice.toFixed(0);
}

function initThemeToggle() {
    const themeToggleInput = document.getElementById("theme-toggle-input");

    if (!themeToggleInput) return;

    const savedTheme = localStorage.getItem("veloce-theme") || "bugatti";

    if (savedTheme === "neon") {
        themeToggleInput.checked = true;
        document.body.classList.add("theme-neon");
    }

    themeToggleInput.addEventListener("change", () => {
        if (themeToggleInput.checked) {
            document.body.classList.add("theme-neon");
            localStorage.setItem("veloce-theme", "neon");
        } else {
            document.body.classList.remove("theme-neon");
            localStorage.setItem("veloce-theme", "bugatti");
        }
    });
}

async function renderFeaturedProducts() {
    const featuredGrid = document.getElementById("featured-products");

    if (!featuredGrid) return;

    featuredGrid.innerHTML = `
        <div class="loading-state">
            SYNCING INVENTORY...
        </div>
    `;

    const products = await loadProducts("./");

    if (!products || products.length === 0) {
        featuredGrid.innerHTML = `
            <p class="empty-state">
                No products found. Please check products.json.
            </p>
        `;
        return;
    }

    featuredGrid.innerHTML = "";

    products.slice(0, 4).forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <a href="pages/product-detail.html?id=${product.id}">
                <img src="${fixImagePath(product.image)}" alt="${product.name}">
            </a>

            <div class="product-info">
                <span class="product-category">${product.category}</span>

                <a href="pages/product-detail.html?id=${product.id}" class="product-title-link">
                    ${product.name}
                </a>

                <div class="product-price">
                    ${formatPrice(product.price)}
                </div>

                <button class="btn btn-primary add-cart-btn" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;

        const addCartButton = card.querySelector(".add-cart-btn");

        addCartButton.addEventListener("click", () => {
            addToCart(product.id);
        });

        featuredGrid.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    initThemeToggle();
    renderFeaturedProducts();
});

window.loadProducts = loadProducts;
window.fixImagePath = fixImagePath;
window.addToCart = addToCart;
window.getCart = getCart;
window.saveCart = saveCart;
window.updateCartCount = updateCartCount;
window.formatPrice = formatPrice;
