/**
 * VELOCE LABS - Core Application Logic
 * Shared product loading, cart handling, theme toggle, and page renderers.
 */

const CART_STORAGE_KEY = 'veloce_cart';
const USER_STORAGE_KEY = 'veloce_user';
const USERS_STORAGE_KEY = 'veloce_users';
const LEGACY_CART_KEYS = ['cart', 'cartItems'];
const CART_WINDOW_NAME_PREFIX = 'VELOCE_CART_DATA:';

let products = [];
let cart = loadSavedCart();
let currentProduct = null;

function normalizeCartItems(items) {
    if (!Array.isArray(items)) return [];

    return items
        .map(item => ({
            ...item,
            id: Number(item.id),
            price: Number(item.price) || 0,
            quantity: Math.max(1, Number(item.quantity) || 1)
        }))
        .filter(item => Number.isFinite(item.id));
}

function readStorageValue(storage, key) {
    try {
        return storage ? storage.getItem(key) : null;
    } catch (error) {
        return null;
    }
}

function writeStorageValue(storage, key, value) {
    try {
        if (storage) storage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}

function removeStorageValue(storage, key) {
    try {
        if (storage) storage.removeItem(key);
    } catch (error) {
        // Some local preview modes block storage access. Ignore safely.
    }
}

function readCartFromWindowName() {
    try {
        if (!window.name || !window.name.startsWith(CART_WINDOW_NAME_PREFIX)) return null;
        return window.name.slice(CART_WINDOW_NAME_PREFIX.length);
    } catch (error) {
        return null;
    }
}

function writeCartToWindowName(value) {
    try {
        window.name = `${CART_WINDOW_NAME_PREFIX}${value}`;
    } catch (error) {
        // Ignore safely.
    }
}

function readCartFromCookie() {
    try {
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${CART_STORAGE_KEY}=`));
        return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
    } catch (error) {
        return null;
    }
}

function writeCartToCookie(value) {
    try {
        document.cookie = `${CART_STORAGE_KEY}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
    } catch (error) {
        // Cookies may be unavailable on local file preview. Ignore safely.
    }
}

function clearCartCookie() {
    try {
        document.cookie = `${CART_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    } catch (error) {
        // Ignore safely.
    }
}

function parseSavedCart(rawValue) {
    if (!rawValue) return [];

    try {
        return normalizeCartItems(JSON.parse(rawValue));
    } catch (error) {
        return [];
    }
}

function readSavedUser() {
    const sources = [window.localStorage, window.sessionStorage];

    for (const storage of sources) {
        try {
            const rawUser = storage ? storage.getItem(USER_STORAGE_KEY) : null;
            if (!rawUser) continue;

            const user = JSON.parse(rawUser);
            if (user && user.email) return user;
        } catch (error) {
            // Ignore blocked storage or invalid saved data.
        }
    }

    return null;
}

function saveUser(user) {
    const payload = JSON.stringify(user);
    writeStorageValue(window.localStorage, USER_STORAGE_KEY, payload);
    writeStorageValue(window.sessionStorage, USER_STORAGE_KEY, payload);
}

function clearSavedUser() {
    removeStorageValue(window.localStorage, USER_STORAGE_KEY);
    removeStorageValue(window.sessionStorage, USER_STORAGE_KEY);
}

const DEFAULT_DEMO_USERS = [
    {
        name: 'Veloce Builder',
        email: 'builder@veloce.systems',
        password: '1234',
        createdAt: 'demo-account',
        isDemo: true
    }
];

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizeRegisteredUsers(users) {
    if (!Array.isArray(users)) return [];

    return users
        .map(user => ({
            name: String(user.name || getDisplayNameFromEmail(user.email)).trim(),
            email: normalizeEmail(user.email),
            password: String(user.password || ''),
            createdAt: user.createdAt || new Date().toISOString(),
            isDemo: Boolean(user.isDemo)
        }))
        .filter(user => isValidEmail(user.email) && user.password.length >= 4);
}

function readStoredRegisteredUsers() {
    const sources = [window.localStorage, window.sessionStorage];

    for (const storage of sources) {
        try {
            const rawUsers = storage ? storage.getItem(USERS_STORAGE_KEY) : null;
            if (!rawUsers) continue;

            const parsedUsers = normalizeRegisteredUsers(JSON.parse(rawUsers));
            if (parsedUsers.length) return parsedUsers;
        } catch (error) {
            // Ignore blocked storage or invalid saved accounts.
        }
    }

    return [];
}

function saveStoredRegisteredUsers(users) {
    const cleanUsers = normalizeRegisteredUsers(users).filter(user => !user.isDemo);
    const payload = JSON.stringify(cleanUsers);
    writeStorageValue(window.localStorage, USERS_STORAGE_KEY, payload);
    writeStorageValue(window.sessionStorage, USERS_STORAGE_KEY, payload);
}

function readRegisteredUsers() {
    const merged = [...DEFAULT_DEMO_USERS, ...readStoredRegisteredUsers()];
    const byEmail = new Map();

    merged.forEach(user => {
        const email = normalizeEmail(user.email);
        if (!byEmail.has(email)) byEmail.set(email, { ...user, email });
    });

    return Array.from(byEmail.values());
}

function findRegisteredUser(email) {
    const targetEmail = normalizeEmail(email);
    return readRegisteredUsers().find(user => user.email === targetEmail) || null;
}

function registerUserAccount(account) {
    const email = normalizeEmail(account.email);
    if (findRegisteredUser(email)) return false;

    const storedUsers = readStoredRegisteredUsers();
    storedUsers.push({
        name: String(account.name || getDisplayNameFromEmail(email)).trim(),
        email,
        password: String(account.password || ''),
        createdAt: new Date().toISOString(),
        isDemo: false
    });
    saveStoredRegisteredUsers(storedUsers);
    return true;
}

function getDisplayNameFromEmail(email) {
    const prefix = String(email || '').split('@')[0] || 'Builder';
    return prefix
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ') || 'Builder';
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function updateAuthUI() {
    const user = readSavedUser();
    const inPagesFolder = window.location.pathname.includes('/pages/');

    document.querySelectorAll('[data-auth-link]').forEach(link => {
        if (user) {
            link.textContent = 'Logout';
            link.setAttribute('href', '#');
            link.setAttribute('aria-label', 'Logout from VELOCE Labs');
        } else {
            link.textContent = 'Login';
            link.setAttribute('href', inPagesFolder ? 'login.html' : 'pages/login.html');
            link.setAttribute('aria-label', 'Login to VELOCE Labs');
        }
    });

    document.querySelectorAll('[data-signup-link]').forEach(link => {
        const wrapper = link.closest('li') || link;
        if (user) {
            wrapper.classList.add('is-hidden');
        } else {
            wrapper.classList.remove('is-hidden');
            link.setAttribute('href', inPagesFolder ? 'signup.html' : 'pages/signup.html');
        }
    });
}

function loadSavedCart() {
    const keysToTry = [CART_STORAGE_KEY, ...LEGACY_CART_KEYS];
    const storageSources = [window.localStorage, window.sessionStorage];

    for (const storage of storageSources) {
        for (const key of keysToTry) {
            const parsed = parseSavedCart(readStorageValue(storage, key));
            if (parsed.length) return parsed;
        }
    }

    const windowCart = parseSavedCart(readCartFromWindowName());
    if (windowCart.length) return windowCart;

    const cookieCart = parseSavedCart(readCartFromCookie());
    if (cookieCart.length) return cookieCart;

    return [];
}

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

async function loadProducts() {
    if (products.length > 0) return products;

    // Product data is stored directly in this file, so no separate products.json file is required.
    products = fallbackProducts;
    return products;
}

function saveCart() {
    const payload = JSON.stringify(normalizeCartItems(cart));

    writeStorageValue(window.localStorage, CART_STORAGE_KEY, payload);
    writeStorageValue(window.sessionStorage, CART_STORAGE_KEY, payload);
    writeCartToWindowName(payload);
    writeCartToCookie(payload);
}

function clearSavedCart() {
    removeStorageValue(window.localStorage, CART_STORAGE_KEY);
    removeStorageValue(window.sessionStorage, CART_STORAGE_KEY);
    LEGACY_CART_KEYS.forEach(key => {
        removeStorageValue(window.localStorage, key);
        removeStorageValue(window.sessionStorage, key);
    });
    writeCartToWindowName('[]');
    clearCartCookie();
}

function updateCartUI() {
    const cartCountElement = document.querySelector('.cart-count');
    if (!cartCountElement) return;

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    cartCountElement.classList.add('pulse');
    setTimeout(() => cartCountElement.classList.remove('pulse'), 500);
}

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

    saveCart();
    updateCartUI();
    renderCart();
    showToast(`${product.name} added to your cart.`);
}

function removeFromCart(productId) {
    const numericId = Number(productId);
    cart = loadSavedCart().filter(item => Number(item.id) !== numericId);
    saveCart();
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

    saveCart();
    updateCartUI();
}

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

function loadingHTML(message = 'SYNCING INVENTORY...') {
    return `<div class="state-message">${escapeHTML(message)}</div>`;
}

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

function checkout() {
    showToast('SYNC INITIATED. REDIRECTING TO PAYMENT PROTOCOL.');
    setTimeout(() => {
        const inPages = window.location.pathname.includes('/pages/');
        window.location.href = inPages ? 'checkout.html' : 'pages/checkout.html';
    }, 900);
}

function initCartPage() {
    cart = loadSavedCart();
    updateCartUI();
    renderCart();
}

function setLoginMessage(message, type = 'info') {
    const messageElement = document.getElementById('login-message');
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.remove('auth-message-error', 'auth-message-success');
    if (type === 'error') messageElement.classList.add('auth-message-error');
    if (type === 'success') messageElement.classList.add('auth-message-success');
}

function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const existingUser = readSavedUser();
    if (existingUser) {
        setLoginMessage(`Already signed in as ${existingUser.email}. Submit again to switch account.`, 'success');
    } else {
        setLoginMessage('Login with your signed-up account, or use the demo login.');
    }

    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!isValidEmail(email)) {
            setLoginMessage('Please enter a valid email address.', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (password.length < 4) {
            setLoginMessage('Password must contain at least 4 characters.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        const account = findRegisteredUser(email);
        if (!account) {
            setLoginMessage('No account found. Please create an account from the signup page first.', 'error');
            return;
        }

        if (account.password !== password) {
            setLoginMessage('Incorrect password. Please try again.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        const user = {
            email: account.email,
            name: account.name || getDisplayNameFromEmail(account.email),
            loginAt: new Date().toISOString(),
            authenticated: true
        };

        saveUser(user);
        updateAuthUI();
        setLoginMessage('Login successful. Opening your profile...', 'success');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Opening Profile...';
        }
        showToast('AUTHENTICATION SUCCESSFUL. SYNCING PROFILE.');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 900);
    });
}


function setSignupMessage(message, type = 'info') {
    const messageElement = document.getElementById('signup-message');
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.remove('auth-message-error', 'auth-message-success');
    if (type === 'error') messageElement.classList.add('auth-message-error');
    if (type === 'success') messageElement.classList.add('auth-message-success');
}

function initSignupPage() {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    if (readSavedUser()) {
        setSignupMessage('You are already logged in. Creating a new account will switch the active profile.', 'success');
    } else {
        setSignupMessage('Create an account to open your VELOCE profile dashboard.');
    }

    signupForm.addEventListener('submit', event => {
        event.preventDefault();
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        const confirmInput = document.getElementById('signup-confirm');
        const submitButton = signupForm.querySelector('button[type="submit"]');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmInput ? confirmInput.value : '';

        if (name.length < 2) {
            setSignupMessage('Please enter your full name.', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        if (!isValidEmail(email)) {
            setSignupMessage('Please enter a valid email address.', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (password.length < 4) {
            setSignupMessage('Password must contain at least 4 characters.', 'error');
            if (passwordInput) passwordInput.focus();
            return;
        }

        if (password !== confirmPassword) {
            setSignupMessage('Passwords do not match.', 'error');
            if (confirmInput) confirmInput.focus();
            return;
        }

        const created = registerUserAccount({ name, email, password });
        if (!created) {
            setSignupMessage('This email already has an account. Please login instead.', 'error');
            return;
        }

        const user = {
            email: normalizeEmail(email),
            name,
            loginAt: new Date().toISOString(),
            authenticated: true
        };

        saveUser(user);
        updateAuthUI();
        setSignupMessage('Account created successfully. Opening your profile...', 'success');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Opening Profile...';
        }
        showToast('ACCOUNT CREATED. PROFILE UNLOCKED.');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 900);
    });
}

function initProfilePage() {
    const emailElement = document.getElementById('profile-email');
    const nameElement = document.getElementById('profile-name');
    const statusElement = document.getElementById('profile-status');
    const cartCountElement = document.getElementById('profile-cart-count');
    const loginAction = document.getElementById('profile-login-action');
    const logoutButton = document.querySelector('[data-logout]');
    const savedUser = readSavedUser();

    if (!savedUser) {
        if (nameElement) nameElement.textContent = 'Guest';
        if (emailElement) emailElement.textContent = 'You are not logged in. Redirecting to login...';
        if (statusElement) statusElement.textContent = 'Locked';
        if (loginAction) loginAction.classList.remove('is-hidden');
        if (logoutButton) logoutButton.classList.add('is-hidden');
        showToast('PLEASE LOGIN TO OPEN YOUR PROFILE.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
        return;
    }

    if (nameElement) nameElement.textContent = savedUser.name || getDisplayNameFromEmail(savedUser.email);
    if (emailElement) emailElement.textContent = `Signed in as ${savedUser.email}`;
    if (statusElement) statusElement.textContent = 'Verified';
    if (loginAction) loginAction.classList.add('is-hidden');
    if (logoutButton) logoutButton.classList.remove('is-hidden');

    if (cartCountElement) {
        const totalItems = loadSavedCart().reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function handleGlobalClicks(event) {
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

    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) {
        event.preventDefault();
        addToCart(addButton.dataset.addToCart);
        return;
    }

    const quantityButton = event.target.closest('[data-cart-quantity]');
    if (quantityButton) {
        updateQuantity(quantityButton.dataset.cartQuantity, quantityButton.dataset.delta);
        renderCart();
        return;
    }

    const removeButton = event.target.closest('[data-cart-remove]');
    if (removeButton) {
        removeFromCart(removeButton.dataset.cartRemove);
        renderCart();
        return;
    }

    const checkoutButton = event.target.closest('[data-checkout]');
    if (checkoutButton) {
        checkout();
        return;
    }

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

    const tabButton = event.target.closest('[data-tab]');
    if (tabButton) {
        document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));
        tabButton.classList.add('active');
        renderDetailTab(tabButton.dataset.tab);
    }
}

async function initPageLogic() {
    const page = document.body.dataset.page;

    if (page === 'home') await initHomePage();
    if (page === 'products') await initProductsPage();
    if (page === 'detail') await initDetailPage();
    if (page === 'cart') initCartPage();
    if (page === 'login') initLoginPage();
    if (page === 'signup') initSignupPage();
    if (page === 'profile') initProfilePage();
    refreshAOS();
}

function initApp() {
    cart = loadSavedCart();
    updateCartUI();
    initTheme();
    initAOS();
    updateAuthUI();
    document.addEventListener('click', handleGlobalClicks);
    initPageLogic();
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.renderCart = renderCart;

window.addEventListener('storage', event => {
    if (event.key === CART_STORAGE_KEY) {
        cart = loadSavedCart();
        updateCartUI();
        renderCart();
    }
});

document.addEventListener('DOMContentLoaded', initApp);
