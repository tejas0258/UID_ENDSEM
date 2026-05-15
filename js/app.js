// ==============================
// VELOCE LABS - Main JavaScript
// ==============================

// ---------- Product Loading ----------

async function loadProducts(basePath = "./") {
    const cleanBasePath = basePath.endsWith("/") ? basePath : basePath + "/";

    const possiblePaths = [
        `${cleanBasePath}products.json`,
        `${cleanBasePath}data/products.json`,
        "products.json",
        "../products.json",
        "../data/products.json"
    ];

    for (const path of possiblePaths) {
        try {
            const response = await fetch(path);

            if (response.ok) {
                const products = await response.json();
                return products;
            }
        } catch (error) {
            // Try next path
        }
    }

    console.error("Could not load products.json");
    return [];
}

// ---------- Image Path Fix ----------

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

// ---------- Cart System ----------

function getCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // If old cart format was only [1, 2, 3], convert it safely
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

// ---------- Price Formatting ----------

function formatPrice(price) {
    const numberPrice = Number(price);

    if (Number.isNaN(numberPrice)) {
        return price;
    }

    return numberPrice.toFixed(0);
}

// ---------- Theme Toggle ----------

function initThemeToggle() {
    const themeToggleInput = document.getElementById("theme-toggle-input");

    if (!themeToggleInput) return;

    const savedTheme = localStorage.getItem("veloce-theme") || "bugatti";

    if (savedTheme === "neon") {
        themeToggleInput.checked = true;
        document.body.classList.add("neon-theme");
    }

    themeToggleInput.addEventListener("change", () => {
        if (themeToggleInput.checked) {
            document.body.classList.add("neon-theme");
            localStorage.setItem("veloce-theme", "neon");
        } else {
            document.body.classList.remove("neon-theme");
            localStorage.setItem("veloce-theme", "bugatti");
        }
    });
}

// ---------- Homepage Featured Products ----------

async function renderFeaturedProducts() {
    const featuredGrid = document.getElementById("featured-products");

    if (!featuredGrid) return;

    featuredGrid.innerHTML = `
        <div class="loading-state">
            SYNCING INVENTORY...
        </div>
    `;

    const data = await loadProducts("./");

    if (!data || data.length === 0) {
        featuredGrid.innerHTML = `
            <p class="empty-state">
                No products found. Please check products.json.
            </p>
        `;
        return;
    }

    featuredGrid.innerHTML = "";

    data.slice(0, 4).forEach(product => {
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

// ---------- Start App ----------

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    initThemeToggle();
    renderFeaturedProducts();
});

// Make these functions available for other pages also
window.loadProducts = loadProducts;
window.fixImagePath = fixImagePath;
window.addToCart = addToCart;
window.getCart = getCart;
window.saveCart = saveCart;
window.updateCartCount = updateCartCount;
