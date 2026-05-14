/**
 * VELOCE LABS - Core Application Logic
 * Handles Product Loading, Cart Management, and Theme Toggling.
 */

// --- State Management ---
let products = [];
let cart = JSON.parse(localStorage.getItem('veloce_cart')) || [];



// --- Universal Image Path Fix ---
function fixImagePath(path) {
    if (!path) return "";

    // External URLs (http/https) — return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // If page is inside /pages folder, prepend ../
    const inPagesFolder = window.location.pathname.includes('/pages/');
    if (inPagesFolder && path.startsWith('assets/')) {
        return '../' + path;
    }

    return path;
}


// --- Theme Toggling ---
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle-input');
    const savedTheme = localStorage.getItem('veloce_theme');
    
    // Apply saved theme on load
    if (savedTheme === 'neon') {
        document.body.classList.add('theme-neon');
        if (themeToggle) themeToggle.checked = true;
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('theme-neon');
                localStorage.setItem('veloce_theme', 'neon');
                showToast("Switching to NEON RACING BLUE");
            } else {
                document.body.classList.remove('theme-neon');
                localStorage.setItem('veloce_theme', 'classic');
                showToast("Switching to CLASSIC BUGATTI BLUE");
            }
        });
    }
}


const fallbackProducts = [
    {
        "id": 1000,
        "name": "ESP32 DevKit",
        "category": "Microcontrollers",
        "price": 100,
        "manufacturer": "VELOCE",
        "image": "assets/products/esp32_devkit.png",
        "shortDescription": "ESP32 DevKit for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1001,
        "name": "Raspberry Pi Pico",
        "category": "Microcontrollers",
        "price": 132,
        "manufacturer": "VELOCE",
        "image": "assets/products/raspberry_pi_pico.png",
        "shortDescription": "Raspberry Pi Pico for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1002,
        "name": "STM32 Blue Pill",
        "category": "Microcontrollers",
        "price": 165,
        "manufacturer": "VELOCE",
        "image": "assets/products/stm32_blue_pill.png",
        "shortDescription": "STM32 Blue Pill for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1003,
        "name": "Arduino Uno",
        "category": "Microcontrollers",
        "price": 198,
        "manufacturer": "VELOCE",
        "image": "assets/products/arduino_uno.png",
        "shortDescription": "Arduino Uno for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1004,
        "name": "NodeMCU ESP8266",
        "category": "Microcontrollers",
        "price": 230,
        "manufacturer": "VELOCE",
        "image": "assets/products/nodemcu_esp8266.png",
        "shortDescription": "NodeMCU ESP8266 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1005,
        "name": "ESP32-CAM",
        "category": "Microcontrollers",
        "price": 262,
        "manufacturer": "VELOCE",
        "image": "assets/products/esp32_cam.png",
        "shortDescription": "ESP32-CAM for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1006,
        "name": "Teensy 4.1",
        "category": "Microcontrollers",
        "price": 295,
        "manufacturer": "VELOCE",
        "image": "assets/products/teensy_4.1.png",
        "shortDescription": "Teensy 4.1 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1007,
        "name": "ATmega328P",
        "category": "Microcontrollers",
        "price": 328,
        "manufacturer": "VELOCE",
        "image": "assets/products/atmega328p.png",
        "shortDescription": "ATmega328P for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Microcontrollers",
            "Interface": "Standard"
        }
    },
    {
        "id": 1008,
        "name": "MPU6050",
        "category": "Sensors",
        "price": 360,
        "manufacturer": "VELOCE",
        "image": "assets/products/mpu6050.png",
        "shortDescription": "MPU6050 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1009,
        "name": "DHT11",
        "category": "Sensors",
        "price": 392,
        "manufacturer": "VELOCE",
        "image": "assets/products/dht11.png",
        "shortDescription": "DHT11 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1010,
        "name": "HC-SR04",
        "category": "Sensors",
        "price": 425,
        "manufacturer": "VELOCE",
        "image": "assets/products/hc_sr04.png",
        "shortDescription": "HC-SR04 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1011,
        "name": "BMP280",
        "category": "Sensors",
        "price": 458,
        "manufacturer": "VELOCE",
        "image": "assets/products/bmp280.png",
        "shortDescription": "BMP280 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1012,
        "name": "PIR Sensor",
        "category": "Sensors",
        "price": 490,
        "manufacturer": "VELOCE",
        "image": "assets/products/pir_sensor.png",
        "shortDescription": "PIR Sensor for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1013,
        "name": "IR Sensor",
        "category": "Sensors",
        "price": 522,
        "manufacturer": "VELOCE",
        "image": "assets/products/ir_sensor.png",
        "shortDescription": "IR Sensor for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1014,
        "name": "MQ2 Gas Sensor",
        "category": "Sensors",
        "price": 555,
        "manufacturer": "VELOCE",
        "image": "assets/products/mq2_gas_sensor.png",
        "shortDescription": "MQ2 Gas Sensor for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1015,
        "name": "LDR Module",
        "category": "Sensors",
        "price": 588,
        "manufacturer": "VELOCE",
        "image": "assets/products/ldr_module.png",
        "shortDescription": "LDR Module for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Sensors",
            "Interface": "Standard"
        }
    },
    {
        "id": 1016,
        "name": "Arduino Nano",
        "category": "Development Boards",
        "price": 620,
        "manufacturer": "VELOCE",
        "image": "assets/products/arduino_nano.png",
        "shortDescription": "Arduino Nano for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1017,
        "name": "Raspberry Pi 4",
        "category": "Development Boards",
        "price": 652,
        "manufacturer": "VELOCE",
        "image": "assets/products/raspberry_pi_4.png",
        "shortDescription": "Raspberry Pi 4 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1018,
        "name": "Jetson Nano",
        "category": "Development Boards",
        "price": 685,
        "manufacturer": "VELOCE",
        "image": "assets/products/jetson_nano.png",
        "shortDescription": "Jetson Nano for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1019,
        "name": "BeagleBone Black",
        "category": "Development Boards",
        "price": 718,
        "manufacturer": "VELOCE",
        "image": "assets/products/beaglebone_black.png",
        "shortDescription": "BeagleBone Black for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1020,
        "name": "ESP32-S3",
        "category": "Development Boards",
        "price": 100,
        "manufacturer": "VELOCE",
        "image": "assets/products/esp32_s3.png",
        "shortDescription": "ESP32-S3 for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1021,
        "name": "Arduino Mega",
        "category": "Development Boards",
        "price": 132,
        "manufacturer": "VELOCE",
        "image": "assets/products/arduino_mega.png",
        "shortDescription": "Arduino Mega for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1022,
        "name": "Pico W",
        "category": "Development Boards",
        "price": 165,
        "manufacturer": "VELOCE",
        "image": "assets/products/pico_w.png",
        "shortDescription": "Pico W for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1023,
        "name": "STM32 Nucleo",
        "category": "Development Boards",
        "price": 198,
        "manufacturer": "VELOCE",
        "image": "assets/products/stm32_nucleo.png",
        "shortDescription": "STM32 Nucleo for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Development Boards",
            "Interface": "Standard"
        }
    },
    {
        "id": 1024,
        "name": "L298N Driver",
        "category": "Components",
        "price": 230,
        "manufacturer": "VELOCE",
        "image": "assets/products/l298n_driver.png",
        "shortDescription": "L298N Driver for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1025,
        "name": "Relay Module",
        "category": "Components",
        "price": 262,
        "manufacturer": "VELOCE",
        "image": "assets/products/relay_module.png",
        "shortDescription": "Relay Module for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1026,
        "name": "NeoPixel Ring",
        "category": "Components",
        "price": 295,
        "manufacturer": "VELOCE",
        "image": "assets/products/neopixel_ring.png",
        "shortDescription": "NeoPixel Ring for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1027,
        "name": "16x2 LCD",
        "category": "Components",
        "price": 328,
        "manufacturer": "VELOCE",
        "image": "assets/products/16x2_lcd.png",
        "shortDescription": "16x2 LCD for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1028,
        "name": "SG90 Servo",
        "category": "Components",
        "price": 360,
        "manufacturer": "VELOCE",
        "image": "assets/products/sg90_servo.png",
        "shortDescription": "SG90 Servo for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1029,
        "name": "LM2596 Buck",
        "category": "Components",
        "price": 392,
        "manufacturer": "VELOCE",
        "image": "assets/products/lm2596_buck.png",
        "shortDescription": "LM2596 Buck for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1030,
        "name": "XL6009 Boost",
        "category": "Components",
        "price": 425,
        "manufacturer": "VELOCE",
        "image": "assets/products/xl6009_boost.png",
        "shortDescription": "XL6009 Boost for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1031,
        "name": "Breadboard",
        "category": "Components",
        "price": 458,
        "manufacturer": "VELOCE",
        "image": "assets/products/breadboard.png",
        "shortDescription": "Breadboard for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Components",
            "Interface": "Standard"
        }
    },
    {
        "id": 1032,
        "name": "18650 Cell",
        "category": "Batteries",
        "price": 490,
        "manufacturer": "VELOCE",
        "image": "assets/products/18650_battery.png",
        "shortDescription": "18650 Cell for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    },
    {
        "id": 1033,
        "name": "LiPo Battery",
        "category": "Batteries",
        "price": 522,
        "manufacturer": "VELOCE",
        "image": "assets/products/lipo_battery.png",
        "shortDescription": "LiPo Battery for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    },
    {
        "id": 1034,
        "name": "9V Battery",
        "category": "Batteries",
        "price": 555,
        "manufacturer": "VELOCE",
        "image": "assets/products/9v_battery.png",
        "shortDescription": "9V Battery for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    },
    {
        "id": 1035,
        "name": "CR2032 Cell",
        "category": "Batteries",
        "price": 588,
        "manufacturer": "VELOCE",
        "image": "assets/products/cr2032_cell.png",
        "shortDescription": "CR2032 Cell for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    },
    {
        "id": 1036,
        "name": "AA Rechargeable",
        "category": "Batteries",
        "price": 620,
        "manufacturer": "VELOCE",
        "image": "assets/products/aa_rechargeable.png",
        "shortDescription": "AA Rechargeable for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    },
    {
        "id": 1037,
        "name": "Battery Holder",
        "category": "Batteries",
        "price": 652,
        "manufacturer": "VELOCE",
        "image": "assets/products/battery_holder.png",
        "shortDescription": "Battery Holder for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    },
    {
        "id": 1038,
        "name": "TP4056 Charger",
        "category": "Batteries",
        "price": 685,
        "manufacturer": "VELOCE",
        "image": "assets/products/tp4056_charger.png",
        "shortDescription": "TP4056 Charger for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    },
    {
        "id": 1039,
        "name": "Power Module",
        "category": "Batteries",
        "price": 718,
        "manufacturer": "VELOCE",
        "image": "assets/products/power_module.png",
        "shortDescription": "Power Module for electronics and embedded projects.",
        "specs": {
            "Voltage": "3.3V/5V",
            "Application": "Embedded Systems",
            "Category": "Batteries",
            "Interface": "Standard"
        }
    }
];


// --- Product Fetching (JSON Integration) ---
async function loadProducts(basePath = '') {
    try {
        const response = await fetch(`${basePath}products.json`);
        products = await response.json();
        return products;
    } catch (error) {
        console.error("Critical error loading electronics inventory from JSON:", error);
        console.warn("Using fallback demo products instead.");
        products = fallbackProducts;
        return fallbackProducts;
    }
}

// --- Cart Management ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast("ERROR: Product manifest not loaded. Please refresh.");
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`${product.name} synced to your manifest.`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast("Item removed from manifest.");
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('veloce_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        // Pulse effect on count change
        cartCountElement.classList.add('pulse');
        setTimeout(() => cartCountElement.classList.remove('pulse'), 500);
    }
}

// --- UI Feedback (Toasts) ---
function showToast(message) {
    // Remove existing toast if present
    const existing = document.querySelector('.v-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'v-toast';
    // Base styles moved to class via initApp styles, but keeping core positioning here for safety
    toast.style.cssText = `
        position: fixed;
        bottom: 40px;
        right: 40px;
        z-index: 9999;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = '0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// --- Common Initializers ---
function initApp() {
    updateCartUI();
    initTheme();
    
    // Add global feedback styles
    if (!document.getElementById('v-app-styles')) {
        const style = document.createElement('style');
        style.id = 'v-app-styles';
        style.innerHTML = `
            @keyframes v-slide-up {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .v-toast {
                background: var(--bg-surface);
                color: var(--accent);
                padding: 20px 40px;
                border-radius: 12px;
                border: 1px solid var(--accent);
                box-shadow: 0 0 30px var(--accent-glow);
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-size: 0.8rem;
                animation: v-slide-up 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            }
            .cart-count.pulse {
                transform: scale(1.4);
                background-color: var(--text-main);
                color: var(--accent);
            }
        `;
        document.head.appendChild(style);
    }
}

// Get URL params for detail/filtering
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener('DOMContentLoaded', initApp);
