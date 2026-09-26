// STOCK PER COLOUR (example values)
const STOCK = {
  "Multicam Black": 50,
  "Dark Navy": 60,
  "Black": 80,
  "Royal Blue": 50,
  "Red": 40,
  "Olive": 40,
  "Dark Grey": 70
};

// PRINTFUL SYNC VARIANT ID MAP
const VARIANTS = {
  "Multicam Black S/M": 5515381228,
  "Multicam Black L/XL": 5515381229,
  "Dark Navy S/M": 5515381230,
  "Dark Navy L/XL": 5515381231,
  "Black S/M": 5515381232,
  "Black L/XL": 5515381233,
  "Royal Blue S/M": 5515381234,
  "Royal Blue L/XL": 5515381235,
  "Red S/M": 5515381236,
  "Red L/XL": 5515381237,
  "Olive S/M": 5515381238,
  "Olive L/XL": 5515381239,
  "Dark Grey S/M": 5515381240,
  "Dark Grey L/XL": 5515381241
};

// PRODUCT DATA
const CAP_IMAGES = {
  "Multicam Black": "/images/multicam-black.png",
  "Dark Navy": "/images/dark-navy.png",
  "Black": "/images/black.png",
  "Royal Blue": "/images/royal-blue.png",
  "Red": "/images/red.png",
  "Olive": "/images/olive.png",
  "Dark Grey": "/images/dark-grey.png"
};

const CAP_PRODUCTS = [
  { name: "Multicam Black", price: 34.99 },
  { name: "Dark Navy", price: 34.99 },
  { name: "Black", price: 34.99 },
  { name: "Royal Blue", price: 34.99 },
  { name: "Red", price: 34.99 },
  { name: "Olive", price: 34.99 },
  { name: "Dark Grey", price: 34.99 }
];

let cart = [];
let cartOpen = false;
let selectedProduct = null;
let selectedPrice = 0;
let currentProductIndex = 0;

// FEATURED PRODUCT SETTER
function setFeatured(cap) {
  const img = document.getElementById("featured-img");
  const nameEl = document.getElementById("featured-name");
  const priceEl = document.getElementById("featured-price");
  const stockEl = document.getElementById("stock-indicator");
  const btn = document.getElementById("featured-btn");

  img.src = CAP_IMAGES[cap.name];
  nameEl.textContent = cap.name + " Cap";
  priceEl.textContent = "£" + cap.price.toFixed(2);

  const remaining = STOCK[cap.name] ?? 0;

  // reset low-stock class
  stockEl.classList.remove("low-stock");

  if (remaining <= 0) {
    stockEl.textContent = "Sold Out";
    btn.disabled = true;
    btn.textContent = "Sold Out";
  } else if (remaining <= 10) {
    stockEl.textContent = `Limited: ${remaining} left`;
    stockEl.classList.add("low-stock");
    btn.disabled = false;
    btn.textContent = "Select Options";
  } else {
    stockEl.textContent = `In Stock: ${remaining}`;
    btn.disabled = false;
    btn.textContent = "Select Options";
  }

  btn.onclick = () => {
    if (STOCK[cap.name] <= 0) {
      alert("This cap is sold out.");
      return;
    }
    openOptions(cap.name, cap.price);
  };
}

// CAROUSEL CONTROLS
function prevProduct() {
  currentProductIndex =
    (currentProductIndex - 1 + CAP_PRODUCTS.length) % CAP_PRODUCTS.length;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

function nextProduct() {
  currentProductIndex =
    (currentProductIndex + 1) % CAP_PRODUCTS.length;
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

// INITIALIZE
window.addEventListener("load", () => {
  setFeatured(CAP_PRODUCTS[0]);
  initSwipe();
  initCountdown();
  hideLoader();
  initMobileMenu();
});

// OPTIONS PANEL
function openOptions(productName, price) {
  selectedProduct = productName;
  selectedPrice = price;

  const panel = document.getElementById("options-panel");
  panel.style.display = "flex";
  panel.style.maxHeight = window.innerHeight * 0.9 + "px";
}

function closeOptions() {
  document.getElementById("options-panel").style.display = "none";
}

// ADD TO CART (with quantity merging + stock)
function addSelected() {
  const color = document.getElementById("opt-color").value;
  const size = document.getElementById("opt-size").value;

  const key = `${color} ${size}`;
  const variantId = VARIANTS[key];

  if (!variantId) {
    alert("Variant not found. Please check colour/size.");
    return;
  }

  if (STOCK[color] <= 0) {
    alert("This colour is sold out.");
    return;
  }

  const existingIndex = cart.findIndex(
    item =>
      item.name === selectedProduct &&
      item.color === color &&
      item.size === size
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      name: selectedProduct,
      color,
      size,
      variant_id: variantId,
      price: selectedPrice,
      quantity: 1
    });
  }

  STOCK[color] -= 1;
  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
  closeOptions();
}

// CART
function updateCart() {
  const cartItemsDiv = document.getElementById("cart-items");
  const cartTotalP = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");

  cartItemsDiv.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    totalItems += item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} (${item.color}, ${item.size}) - £${item.price.toFixed(2)}</span>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQuantity(${index}, -1, event)">-</button>
        <span>x${item.quantity}</span>
        <button class="qty-btn" onclick="changeQuantity(${index}, 1, event)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${index}, event)">✖</button>
      </div>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartTotalP.textContent = `Total: £${total.toFixed(2)}`;
  cartCount.textContent = totalItems;
}

function removeFromCart(index, event) {
  event.stopPropagation();
  const item = cart[index];
  STOCK[item.color] += item.quantity;
  cart.splice(index, 1);
  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

function changeQuantity(index, delta, event) {
  event.stopPropagation();
  const item = cart[index];

  if (delta > 0) {
    if (STOCK[item.color] <= 0) {
      alert("No more stock for this colour.");
      return;
    }
    item.quantity += 1;
    STOCK[item.color] -= 1;
  } else {
    item.quantity -= 1;
    STOCK[item.color] += 1;
    if (item.quantity <= 0) {
      cart.splice(index, 1);
    }
  }

  updateCart();
  setFeatured(CAP_PRODUCTS[currentProductIndex]);
}

function toggleCart() {
  const panel = document.getElementById("cart-panel");
  cartOpen = !cartOpen;
  panel.classList.toggle("open", cartOpen);
}

// MOBILE CART CLOSE FIX
document.addEventListener("click", function (event) {
  const panel = document.getElementById("cart-panel");
  const cartIcon = document.querySelector(".cart-icon");

  if (cartOpen &&
      !panel.contains(event.target) &&
      !cartIcon.contains(event.target)) {

    if (event.clientX < window.innerWidth - 80) {
      toggleCart();
    }
  }
});

// SWIPE SUPPORT
function initSwipe() {
  const box = document.getElementById("featured-box");
  let startX = 0;
  let endX = 0;

  box.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  box.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = endX - startX;

    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        nextProduct();
      } else {
        prevProduct();
      }
    }
  });
}

// MOBILE MENU
function initMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  menu.classList.remove("open");
}

// LOADER
function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
    }, 300);
  }
}

// ===== SMART CHECKOUT LOGIC =====

function normalizeCountry(code) {
  if (!code) return "";
  let c = code.trim().toUpperCase();

  const map = {
    "UK": "GB",
    "U.K.": "GB",
    "ENGLAND": "GB",
    "SCOTLAND": "GB",
    "WALES": "GB",
    "NORTHERN IRELAND": "GB"
  };

  return map[c] || c;
}

const COUNTRIES_REQUIRE_STATE = ["US", "CA", "AU", "MX", "BR"];

function validatePostcode(country, zip) {
  const patterns = {
    GB: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    AU: /^\d{4}$/,
    BR: /^\d{8}$/,
    MX: /^\d{5}$/
  };

  if (!patterns[country]) return true;
  return patterns[country].test(zip);
}

function validateRecipient(name, address, city, zip, country, state) {
  if (!name || !address || !city || !zip || !country) {
    return "Please fill in all required fields.";
  }

  country = normalizeCountry(country);

  if (country.length !== 2) {
    return "Country code must be a 2-letter code (e.g. GB, US, DE, AE).";
  }

  if (!validatePostcode(country, zip)) {
    return `Postcode format is invalid for ${country}.`;
  }

  if (COUNTRIES_REQUIRE_STATE.includes(country) && !state) {
    return `A state/region is required for ${country}.`;
  }

  return null;
}

// CHECKOUT
function openCheckout() {
  const form = document.getElementById("checkout-form");
  form.style.display = "flex";
  form.style.maxHeight = window.innerHeight * 0.9 + "px";
}

function closeCheckout() {
  document.getElementById("checkout-form").style.display = "none";
}

async function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const name = document.getElementById("cust-name").value.trim();
  const address = document.getElementById("cust-address").value.trim();
  const city = document.getElementById("cust-city").value.trim();
  const state = document.getElementById("cust-state").value.trim();
  const zip = document.getElementById("cust-zip").value.trim();
  let country = document.getElementById("cust-country").value.trim();

  country = normalizeCountry(country);

  const error = validateRecipient(name, address, city, zip, country, state);
  if (error) {
    alert(error);
    return;
  }

const items = cart.map(item => ({
  sync_variant_id: item.variant_id,
  quantity: item.quantity
}));

  const recipient = {
    name,
    address1: address,
    city,
    zip,
    country_code: country
  };

  if (state) {
    recipient.state_code = state;
  }

  const order = {
    recipient,
    items
  };

  try {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.display = "flex";
      loader.style.opacity = "1";
    }

    const response = await fetch("http://localhost:3000/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const data = await response.json();
    console.log("Printful response:", data);

    if (data.code && data.code !== 200) {
      alert(`Printful error: ${data.result || (data.error && data.error.message) || "Unknown error"}`);
      return;
    }

    alert("Order sent! Check Printful dashboard.");
    closeCheckout();
    cart = [];
    updateCart();
    setFeatured(CAP_PRODUCTS[currentProductIndex]);

  } catch (err) {
    console.error("Checkout error:", err);
    alert("There was a problem sending the order. Check console for details.");
  } finally {
    hideLoader();
  }
}

// COUNTDOWN TIMER
function initCountdown() {
  const timerEl = document.getElementById("countdown-timer");
  if (!timerEl) return;

  // Example: drop ends in 7 days from now
  const end = new Date();
  end.setDate(end.getDate() + 7);

  function update() {
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) {
      timerEl.textContent = "Drop closed";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);

    timerEl.textContent = `${days}d ${hours}h ${mins}m`;
  }

  update();
  setInterval(update, 60000);
}

// IMAGE LIGHTBOX
function openLightbox(src) {
  const box = document.getElementById("image-lightbox");
  const img = document.getElementById("lightbox-img");

  img.src = src;
  box.style.display = "flex";
}

window.addEventListener("load", () => {
  const lightbox = document.getElementById("image-lightbox");
  if (lightbox) {
    lightbox.addEventListener("click", () => {
      lightbox.style.display = "none";
    });
  }
});


