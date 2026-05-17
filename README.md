<div align="center">

<h1>⚡ VELOCE LABS</h1>
<p><strong>Premium Motorsport-Inspired Electronics Marketplace</strong></p>

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-tejas0258.github.io-0051BA?style=for-the-badge)](https://tejas0258.github.io/UID_ENDSEM/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<br/>

> *Industrial-grade electronics for professional engineers — batteries, microcontrollers, sensors, and development boards, wrapped in a dark motorsport aesthetic.*

<br/>

![VELOCE Login Screen](https://img.shields.io/badge/UI-Dark_Theme_%7C_Blue_Accent-0051BA?style=flat-square)
![Pages](https://img.shields.io/badge/Pages-9-black?style=flat-square)
![Products](https://img.shields.io/badge/Products-40%2B-0051BA?style=flat-square)
![No Backend](https://img.shields.io/badge/Backend-None_(Pure_Frontend)-success?style=flat-square)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Pages](#-pages)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Product Catalog](#-product-catalog)
- [Authentication System](#-authentication-system)
- [Cart & Checkout](#-cart--checkout)
- [Adding Products](#-adding-new-products)
- [Theme System](#-theme-system)
- [Contributing](#-contributing)

---

## 🔭 Overview

**VELOCE LABS** is a fully client-side e-commerce frontend for a premium electronics store. Built as a UI/UX Design end-semester project, it features a complete shopping experience — from browsing and filtering products to adding items to cart, user authentication, and a multi-step checkout flow with UPI, card, and cash-on-delivery payment options.

No server. No database. No framework. Just HTML, CSS, and vanilla JavaScript — all state managed via `localStorage` and `sessionStorage`.

---

## ✨ Features

### 🛒 Shopping
- Browse 40+ electronics products across 5 categories
- Filter by category, sort by price / name / rating
- Persistent cart saved across browser sessions
- Quantity adjustment and item removal
- Real-time cart count badge in the navbar

### 🔐 Authentication
- Sign up with email and password (stored in `localStorage`)
- Login/logout with session persistence
- Protected profile page — redirects unauthenticated users
- Demo account: `builder@veloce.systems` / `1234`

### 💳 Checkout
- Multi-step progress indicator (Cart → Details → Payment → Confirm)
- Full address form with state selector (all Indian states)
- **UPI** — PhonePe, Google Pay, RuPay options with UPI ID validation
- **Debit / Credit Card** — live card visual that updates as you type
- **Cash on Delivery** — no extra fields required
- 18% GST calculated automatically
- Real-time field validation with inline error messages
- Animated order confirmation overlay with unique order ID

### 🎨 UI / UX
- Dark theme (`#0B0B0B` background) with electric blue (`#0051BA`) accent
- Theme toggle — switch between *Bugatti Blue* and *Neon Blue* accent modes
- Scroll-triggered animations via [AOS](https://michalsnik.github.io/aos/)
- Fully responsive layout (mobile → desktop)
- Custom scrollbar, smooth transitions, hover micro-interactions

---

## 📄 Pages

| Page | Path | Description |
|------|------|-------------|
| **Home** | `index.html` | Hero, category grid, featured products |
| **Products** | `pages/products.html` | Full catalog with filter + sort |
| **Product Detail** | `pages/product-detail.html` | Specs, dimensions, add to cart |
| **Cart** | `pages/cart.html` | Cart items, quantity controls, order summary |
| **Checkout** | `pages/checkout.html` | Address form + payment (UPI / Card / COD) |
| **Login** | `pages/login.html` | Email + password authentication |
| **Sign Up** | `pages/signup.html` | New user registration |
| **Profile** | `pages/profile.html` | Account info, order history placeholder |
| **About** | `pages/about.html` | Brand story and team |
| **FAQ** | `pages/faq.html` | Frequently asked questions |

---

## 📁 Project Structure

```
UID_ENDSEM-main/
│
├── index.html                  # Home page
│
├── pages/
│   ├── about.html
│   ├── cart.html
│   ├── checkout.html           # ← Checkout + payment page
│   ├── faq.html
│   ├── login.html
│   ├── product-detail.html
│   ├── products.html
│   ├── profile.html
│   └── signup.html
│
├── css/
│   └── style.css               # Global styles + CSS variables
│
├── js/
│   └── app.js                  # All logic: products, cart, auth, routing
│
└── assets/
    └── products/               # Product images (.png)
```

---

## 🧰 Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Markup and page structure |
| **CSS3** | Custom properties, animations, responsive layout |
| **Vanilla JavaScript (ES6+)** | All interactivity, state, routing |
| **Tailwind CSS** (CDN) | Utility classes for rapid layout |
| **AOS.js** | Scroll-triggered reveal animations |
| **localStorage / sessionStorage** | Cart, user auth, preferences persistence |

> Zero build tools. Zero npm. Open `index.html` in a browser and it just works.

---

## 🚀 Getting Started

### Option 1 — Open Directly
No setup required. Just clone and open:

```bash
git clone https://github.com/tejas0258/UID_ENDSEM.git
cd UID_ENDSEM
# Open index.html in your browser
```

### Option 2 — Live Server (Recommended)
For the best experience with relative paths, use a local server:

```bash
# VS Code — install the "Live Server" extension, then right-click index.html → Open with Live Server

# Python
python -m http.server 8000
# Visit http://localhost:8000

# Node.js
npx serve .
```

### Demo Account
You can log in instantly using the built-in demo account:

```
Email:    builder@veloce.systems
Password: 1234
```

---

## 📦 Product Catalog

Products are defined inline in `js/app.js` as a JavaScript array. There are **40 products** across **5 categories**:

| Category | Count | Examples |
|----------|-------|---------|
| **Microcontrollers** | 8 | ESP32, Arduino Uno, Raspberry Pi Pico, STM32 |
| **Sensors** | 8 | MPU6050, DHT11, HC-SR04, BMP280, PIR |
| **Development Boards** | 8 | Jetson Nano, Orange Pi, FPGA boards |
| **Batteries** | 8 | LiPo packs, 18650 cells, BMS modules |
| **Components** | 8 | Resistors, MOSFETs, capacitors, relays |

---

## 🔐 Authentication System

Authentication is fully client-side using `localStorage`. Here's how it works:

```
Sign Up  →  account saved to localStorage['veloce_users']
Login    →  credentials checked against stored users
Session  →  current user stored in localStorage['veloce_user']
Logout   →  localStorage['veloce_user'] cleared
```

**Key functions in `app.js`:**

| Function | Description |
|----------|-------------|
| `registerUserAccount(account)` | Saves a new user to the registered users list |
| `findRegisteredUser(email)` | Looks up a user by normalised email |
| `saveUser(user)` | Persists the logged-in session |
| `readSavedUser()` | Returns the current session user object |
| `clearSavedUser()` | Logs the user out |
| `updateAuthUI()` | Shows/hides Login vs Profile nav links |

> ⚠️ **Note:** This is a frontend-only demo. Passwords are stored in plain text in `localStorage` and are not suitable for production use.

---

## 🛒 Cart & Checkout

### Cart
The cart is stored in `localStorage` under `veloce_cart` and falls back to `sessionStorage` and `document.cookie` for maximum persistence.

```js
// Cart item structure
{
  id: 1,
  name: "ESP32 DevKit V1",
  price: 349.00,
  quantity: 2,
  image: "assets/products/esp32_devkit.png"
}
```

### Checkout Flow
```
Cart Page
  └─ Click "Checkout"
       └─ pages/checkout.html
            ├─ Contact Info (email, phone)
            ├─ Delivery Address (name, address, city, state, PIN)
            └─ Payment
                 ├─ UPI  →  PhonePe / GPay / RuPay  +  UPI ID
                 ├─ Card →  Live card visual  +  number / expiry / CVV
                 └─ COD  →  No extra input needed
```

On successful order placement, the cart is cleared and a confirmation overlay shows a unique order reference (`VL-XXXXXX`).

---

## 🖼️ Adding New Products

1. Place your image inside `assets/products/`:
   ```
   assets/products/your-component.png
   ```

2. Add an entry to the `products` array in `js/app.js`:
   ```js
   {
     "id": 41,
     "name": "Your Component Name",
     "category": "Components",          // Microcontrollers | Sensors | Development Boards | Batteries | Components
     "price": 199.00,
     "rating": 4.5,
     "stock": 50,
     "image": "assets/products/your-component.png",
     "description": "Short product description here.",
     "specs": {
       "Voltage": "3.3V",
       "Interface": "I2C / SPI"
     },
     "dimensions": "24mm × 18mm × 3mm",
     "weight": "3g"
   }
   ```

---

## 🎨 Theme System

The site ships with two accent colour modes, toggled by the switch in the navbar:

| Mode | CSS Class | Accent Colour |
|------|-----------|---------------|
| **Bugatti Blue** (default) | *(none)* | `#0051BA` |
| **Neon Blue** | `body.theme-neon` | `#0088FF` |

All colours reference CSS custom properties defined in `style.css`:

```css
:root {
  --accent:       #0051BA;
  --accent-glow:  rgba(0, 81, 186, 0.4);
  --bg-dark:      #0B0B0B;
  --bg-surface:   #161616;
  --text-main:    #FFFFFF;
  --text-muted:   #888888;
}
```

---

## 🤝 Contributing

This is an academic project, but PRs are welcome for:
- Additional product entries
- Bug fixes
- Accessibility improvements
- Mobile layout tweaks

```bash
# Fork → Clone → Branch → Commit → PR
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
```

---

## 📜 License

This project was built as a **UI/UX Design end-semester submission**. Feel free to use it as a reference or starting point for your own projects.

---

<div align="center">

**VELOCE LABS** — *Engineered for Precision.*

Made with 🔵 and a lot of `localStorage`

</div>
