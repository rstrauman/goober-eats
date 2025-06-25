/* ============================================================================
   script.js — Landing-page logic
   ---------------------------------------------------------------------------
   • Fetches /restaurants and renders cards
   • Toggles / filters with a search bar
   • Wires cart icon to cart.html
   ========================================================================== */

document.addEventListener("DOMContentLoaded", init);

/* ───────────────────────────── Globals ──────────────────────────────── */
let restaurants = [];                     // holds fetched data for reuse
const containerId = "restaurant-list";

/* ───────────────────────────── Init Flow ────────────────────────────── */
async function init() {
  wireCartButton();
  wireSearchUI();
  await loadRestaurants();                // fetch + initial full render
}

/* ─────────────────────── Cart Navigation Button ─────────────────────── */
function wireCartButton() {
  const cartBtn = document.getElementById("cart");
  if (cartBtn) cartBtn.onclick = () => (window.location.href = "cart.html");
}

/* ─────────────────────────── Search UI ──────────────────────────────── */
function wireSearchUI() {
  const searchBtn   = document.getElementById("search");
  const searchInput = document.getElementById("search-input");

  /* Toggle visibility */
  searchBtn.addEventListener("click", () => {
    searchInput.classList.toggle("show");

    if (searchInput.classList.contains("show")) {
      searchInput.focus();
    } else {
      searchInput.value = "";
      renderRestaurants(restaurants);     // reset list
    }
  });

  /* Debounced live filter */
  searchInput.addEventListener(
    "input",
    debounce((e) => {
      const q = e.target.value.trim().toLowerCase();
      renderRestaurants(restaurants, q);
    }, 200)
  );
}

/* Simple debounce helper */
function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* ──────────────────────── Data Fetching ─────────────────────────────── */
async function loadRestaurants() {
  try {
    const res = await fetch("/restaurants");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    restaurants = await res.json();
    renderRestaurants(restaurants);       // initial render
  } catch (err) {
    console.error("Failed to fetch restaurants:", err);
    document.getElementById(containerId).textContent =
      "Sorry, we couldn’t load restaurants.";
  }
}

/* ───────────────────────── Rendering Logic ──────────────────────────── */
/**
 * Render a (filtered) restaurant list.
 * @param {Array} data  – full restaurant array
 * @param {String} [query] – lowercase search term
 */
function renderRestaurants(data = [], query = "") {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found.`);
    return;
  }

  /* Filter by search query */
  const list = query
    ? data.filter((r) =>
        r.name.toLowerCase().includes(query) ||
        r.location?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
      )
    : data;

  /* Clear existing content */
  container.innerHTML = "";

  if (list.length === 0) {
    container.textContent = "No restaurants match your search.";
    return;
  }

  /* Build cards */
  list.forEach(({ id, name, image, deliveryFee, rating }) => {
    const card = document.createElement("div");
    card.className = "restaurant-card";
    card.innerHTML = `
      <a href="menu.html?id=${id}" class="restaurant-link">
        <img src="${image}" alt="${name}" width="200" />
        <h2>${name}</h2>
        <p>Delivery Fee: $${deliveryFee.toFixed(2)}</p>
        <p>Rating: ⭐ ${rating}</p>
      </a>`;
    container.appendChild(card);
  });
}







