
const products = [
  {
    id: 1, name: "iPhone 15 Pro", category: "Electronics",
    price: 1250000, oldPrice: 1400000, rating: 4.8, sale: true,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2, name: "MacBook Air", category: "Electronics",
    price: 1850000, oldPrice: null, rating: 4.9,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3, name: "Wireless Headphones", category: "Electronics",
    price: 85000, oldPrice: 105000, rating: 4.6, sale: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4, name: "Classic Sneakers", category: "Shoes",
    price: 65000, oldPrice: null, rating: 4.7,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5, name: "Smart Watch", category: "Accessories",
    price: 95000, oldPrice: 120000, rating: 4.5, sale: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6, name: "Travel Backpack", category: "Fashion",
    price: 35000, oldPrice: null, rating: 4.4,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7, name: "Premium Sunglasses", category: "Accessories",
    price: 18000, oldPrice: 25000, rating: 4.3, sale: true,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8, name: "Classic Wristwatch", category: "Accessories",
    price: 55000, oldPrice: null, rating: 4.6,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9, name: "Casual T-Shirt", category: "Fashion",
    price: 12000, oldPrice: 16000, rating: 4.4, sale: true,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10, name: "Running Shoes", category: "Shoes",
    price: 48000, oldPrice: null, rating: 4.7,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11, name: "Wireless Earbuds", category: "Electronics",
    price: 28000, oldPrice: 35000, rating: 4.5, sale: true,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12, name: "Leather Handbag", category: "Fashion",
    price: 42000, oldPrice: null, rating: 4.6,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
  }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const money = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount);

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("shopease-cart") || "[]");

    if (!Array.isArray(saved)) return [];

    return saved.filter(item =>
      item &&
      products.some(product => product.id === item.id) &&
      Number.isInteger(item.qty) &&
      item.qty > 0 &&
      item.qty <= 99
    );
  } catch {
    return [];
  }
}

let cart = loadCart();
let activeCategory = "All";
let searchTerm = "";
let favorites = new Set();
let toastTimer;

const productGrid = $("#productGrid");
const emptyState = $("#emptyState");
const cartDrawer = $("#cartDrawer");
const overlay = $("#overlay");
const checkoutModal = $("#checkoutModal");

function saveCart() {
  try {
    localStorage.setItem("shopease-cart", JSON.stringify(cart));
  } catch {
    showToast("Cart storage unavailable. Your cart may not persist.");
  }
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function renderProducts() {
  let filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  const sort = $("#sortSelect").value;

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  $("#resultCount").textContent =
    `${filtered.length} product${filtered.length === 1 ? "" : "s"} available`;

  emptyState.hidden = filtered.length !== 0;

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.sale ? '<span class="sale-tag">SALE</span>' : ""}
        <button class="wish-btn ${favorites.has(product.id) ? "liked" : ""}"
          data-favorite="${product.id}"
          aria-label="${favorites.has(product.id) ? "Remove from" : "Add to"} favorites"
          aria-pressed="${favorites.has(product.id)}">
          <i class="fa-${favorites.has(product.id) ? "solid" : "regular"} fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>
        <div class="rating">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star-half-stroke"></i>
          <span>(${product.rating})</span>
        </div>
        <div class="price-row">
          <span class="price">${money(product.price)}</span>
          ${product.oldPrice
            ? `<span class="old-price">${money(product.oldPrice)}</span>`
            : ""}
        </div>
        <button class="add-cart" data-add="${product.id}">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.qty, 0);
  const subtotal = cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);
    return total + (product ? product.price * item.qty : 0);
  }, 0);

  $("#cartCount").textContent = count;
  $("#cartSubtotal").textContent = money(subtotal);
  $("#checkoutTotal").textContent = money(subtotal);
  $("#checkoutBtn").disabled = cart.length === 0;

  if (cart.length === 0) {
    $("#cartItems").innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <h3>Your cart is empty</h3>
        <p>Find something you love and add it here.</p>
      </div>`;
    return;
  }

  $("#cartItems").innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";

    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h4>${product.name}</h4>
          <p class="item-price">${money(product.price * item.qty)}</p>
          <div class="quantity">
            <button data-qty="${product.id}" data-change="-1"
              aria-label="Decrease ${product.name} quantity">−</button>
            <span>${item.qty}</span>
            <button data-qty="${product.id}" data-change="1"
              aria-label="Increase ${product.name} quantity">+</button>
          </div>
        </div>
        <button class="remove-btn" data-remove="${product.id}"
          aria-label="Remove ${product.name}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>`;
  }).join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    if (existing.qty >= 99) {
      showToast("Maximum quantity is 99.");
      return;
    }
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to your cart!`);
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(item => item.id !== id);
  } else if (item.qty > 99) {
    item.qty = 99;
    showToast("Maximum quantity is 99.");
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  showToast("Item removed from cart.");
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("visible");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
  $("#closeCart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
  document.body.classList.remove("no-scroll");
  $("#cartToggle").focus();
}

function closeCheckout() {
  checkoutModal.hidden = true;
  document.body.classList.remove("no-scroll");
  $("#cartToggle").focus();
}

// Event delegation for product buttons.
productGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const favoriteButton = event.target.closest("[data-favorite]");

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }

  if (favoriteButton) {
    const id = Number(favoriteButton.dataset.favorite);

    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }

    renderProducts();
  }
});

// Event delegation for cart controls.
$("#cartItems").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    changeQuantity(
      Number(quantityButton.dataset.qty),
      Number(quantityButton.dataset.change)
    );
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

// Category selection.
$$(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    $$(".category-card").forEach(card => {
      const selected = card === button;
      card.classList.toggle("active", selected);
      card.setAttribute("aria-pressed", selected);
    });

    renderProducts();
    $("#products").scrollIntoView({ behavior: "smooth" });
  });
});

// Search.
$("#searchInput").addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

$("#searchForm").addEventListener("submit", event => {
  event.preventDefault();
  renderProducts();
  $("#products").scrollIntoView({ behavior: "smooth" });
});

$("#sortSelect").addEventListener("change", renderProducts);

$("#resetFilters").addEventListener("click", () => {
  activeCategory = "All";
  searchTerm = "";
  $("#searchInput").value = "";
  $("#sortSelect").value = "featured";

  $$(".category-card").forEach(card => {
    const selected = card.dataset.category === "All";
    card.classList.toggle("active", selected);
    card.setAttribute("aria-pressed", selected);
  });

  renderProducts();
});

// Cart drawer.
$("#cartToggle").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

$("#menuToggle").addEventListener("click", () => {
  $("#nav").classList.toggle("open");
});

$("#nav").addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#nav").classList.remove("open");
  }
});

// Toggle search visibility on small screens.
$("#mobileSearch").addEventListener("click", () => {
  const search = $("#searchForm");
  search.classList.toggle("mobile-visible");

  if (search.classList.contains("mobile-visible")) {
    $("#searchInput").focus();
  }
});

// Demo checkout.
$("#checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return;

  closeCart();
  checkoutModal.hidden = false;
  document.body.classList.add("no-scroll");
  $("#orderMessage").hidden = true;
  $("#checkoutForm").hidden = false;
  $("#customerName").focus();
});

$("#closeCheckout").addEventListener("click", closeCheckout);

checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) closeCheckout();
});

$("#checkoutForm").addEventListener("submit", event => {
  event.preventDefault();

  if (cart.length === 0) {
    showToast("Your cart is empty.");
    closeCheckout();
    return;
  }

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  // This is a frontend demonstration, not a real order.
  const orderNumber = "DEMO-" + Date.now().toString().slice(-8);
  const message = $("#orderMessage");

  message.innerHTML = `
    <i class="fa-solid fa-circle-check"
      style="color: #16a34a; font-size: 30px;"></i>
    <h3>Demo order created!</h3>
    <p>Reference: <strong>${orderNumber}</strong></p>
    <p>Your checkout form worked, but no real order or payment was processed.</p>
    <button type="button" class="btn btn-primary full-width"
      id="finishOrder" style="margin-top:18px">Continue Shopping</button>
  `;

  form.hidden = true;
  message.hidden = false;

  cart = [];
  saveCart();
  renderCart();

  $("#finishOrder").addEventListener("click", () => {
    closeCheckout();
    form.reset();
  });
});

// Newsletter demo.
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  $("#newsletterMessage").textContent =
    "Thanks for your interest! Newsletter signup needs a backend.";
  event.currentTarget.reset();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (!checkoutModal.hidden) {
      closeCheckout();
    } else if (cartDrawer.classList.contains("open")) {
      closeCart();
    } else {
      $("#nav").classList.remove("open");
    }
  }
});

$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();