// cart.js – logic for cart.html
// -----------------------------------------------------------------------------
// Constants & State
// -----------------------------------------------------------------------------
const CART_KEY = "cart";

// Load/save cart from/to localStorage
const loadCart = () => JSON.parse(localStorage.getItem(CART_KEY) || "[]");
const saveCart = (cart) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

let cart = loadCart();

// DOM references
const $items = document.getElementById("cart-items");
const $total = document.getElementById("cart-total");
const $clear = document.getElementById("clear-cart-btn");
const $home = document.getElementById("home");

// Utility to format price as currency
const fmt = (num) => `$${num.toFixed(2)}`;

// -----------------------------------------------------------------------------
// Render cart items and summary
// -----------------------------------------------------------------------------
function renderCart() {
  $items.innerHTML = "";

  if (cart.length === 0) {
    $items.textContent = "Your cart is empty.";
    $total.textContent = "Total: $0.00";
    $clear.disabled = true;
    return;
  }

  $clear.disabled = false;

  let grandTotal = 0;

  cart.forEach(item => {
    grandTotal += item.totalPrice;

    // Build customization list if any
    const customList = Object.entries(item.customizations || {})
      .map(([key, val]) => `<li>${key}: ${val}</li>`)
      .join("");

    // Create cart item element
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <img class="cart-img" src="${item.image}" alt="${item.name}" />
      </div>
      <p>Quantity: ${item.quantity}</p>
      <p>Price: ${fmt(item.totalPrice)}</p>
      ${customList ? `<ul>${customList}</ul>` : ""}
      <button class="remove-btn" data-id="${item.id}">Remove</button>
    `;

    $items.appendChild(div);
  });

  $total.textContent = `Total: ${fmt(grandTotal)}`;
}

// -----------------------------------------------------------------------------
// Cart modification functions
// -----------------------------------------------------------------------------
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart(cart);
  renderCart();
}

// -----------------------------------------------------------------------------
// Event listeners
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", renderCart);

$items.addEventListener("click", e => {
  if (e.target.matches(".remove-btn")) {
    const id = Number(e.target.dataset.id);
    removeFromCart(id);
  }
});

$clear.addEventListener("click", clearCart);

if ($home) {
  $home.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

