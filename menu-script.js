/* ============================================================================
   menu-script.js — Menu-page logic
   ---------------------------------------------------------------------------
   • Loads restaurant details and menu items
   • Category + search filtering
   • Customization modal & add-to-cart
   • Home / cart navigation
   ========================================================================== */

document.addEventListener("DOMContentLoaded", init);

/* --------------------------- State ------------------------------------- */
let fullMenu     = [];      // all items for this restaurant
let activeFilter = "all";   // current category ("all" by default)

/* --------------------------- Init -------------------------------------- */
async function init() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    alert("No restaurant ID provided");
    return;
  }

  wireStaticButtons();
  wireFiltersUI();
  wireSearchBox();

  try {
    await loadRestaurantInfo(id);
    await loadMenuItems(id);          // also triggers initial render
  } catch (err) {
    console.error(err);
    alert("Could not load restaurant data.");
  }
}

/* ------------------------ Navigation buttons --------------------------- */
function wireStaticButtons() {
  document.getElementById("cart")?.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  document.getElementById("home")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

/* ------------------------ Category filter buttons ---------------------- */
function wireFiltersUI() {
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("[data-filter]")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeFilter = btn.dataset.filter;
      applyFiltersAndSearch();
    });
  });
}

/* ------------------------ Search input --------------------------------- */
function wireSearchBox() {
  const box = document.getElementById("restaurant-search");
  if (!box) return;

  box.addEventListener(
    "input",
    debounce(() => applyFiltersAndSearch(), 200)
  );
}

/* ------------------------ Data loading --------------------------------- */
async function loadRestaurantInfo(id) {
  const res = await fetch("data/restaurants.json");
  if (!res.ok) throw new Error("Failed to load restaurants.json");

  const restaurants = await res.json();
  const r = restaurants.find(x => x.id == id);
  if (!r) throw new Error("Restaurant not found");

  document.getElementById("restaurant-banner-image").src = r.image;
  document.getElementById("restaurant-banner-image").alt = r.name;
  document.getElementById("restaurant-rating").textContent   = `⭐ ${r.rating}`;
  document.getElementById("restaurant-fee").textContent      = `Delivery Fee: $${r.deliveryFee.toFixed(2)}`;
  document.getElementById("restaurant-location").textContent = r.location;
  document.getElementById("restaurant-name").textContent     = r.name;

  const sb = document.getElementById("restaurant-search");
  if (sb) sb.placeholder = `Search in ${r.name}`;
}

async function loadMenuItems(id) {
  const res = await fetch("data/menus.json");
  if (!res.ok) throw new Error("Failed to load menus.json");

  const menus = await res.json();
  fullMenu = menus[id] || [];

  applyFiltersAndSearch();            // initial render
}

/* ------------------------ Filtering + rendering ------------------------ */
function applyFiltersAndSearch() {
  const q = document
    .getElementById("restaurant-search")
    ?.value.trim()
    .toLowerCase() || "";

  const list = fullMenu.filter(item => {
    const matchesCat =
      activeFilter === "all" || item.category === activeFilter;

    const matchesTxt =
  !q ||
  item.name.toLowerCase().includes(q) ||
  item.description.toLowerCase().includes(q) ||
  (item.category && item.category.toLowerCase().includes(q));


    return matchesCat && matchesTxt;
  });

  renderMenu(list);
}

function renderMenu(items) {
  const box = document.getElementById("menu-container");
  if (!box) return;

  box.innerHTML = items.length
    ? ""
    : "<p>No menu items found.</p>";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.style.cursor = "pointer";
    div.innerHTML = `
      <img class="menu-item-image" src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p>Price: $${item.price.toFixed(2)}</p>`;
    div.onclick = () => openCustomizationModal(item);
    box.appendChild(div);
  });
}

/* ------------------------ Debounce helper ----------------------------- */
function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* ------------------------ Modal + cart (unchanged) -------------------- */
function openCustomizationModal(item) {
  const modal = document.getElementById("customization-modal");
  const mc    = modal.querySelector(".modal-content");

  mc.innerHTML = `
    <span class="close-button">&times;</span>
    <div class="customization-wrapper">
      <main>
        <img class="customize-menu-img" src="${item.image}" alt="${item.name}" />
        <h2>${item.name}</h2>
        <p>${item.description}</p>
        <p>Price: $${item.price.toFixed(2)}</p>
        <button id="add-to-cart-btn">Add to Cart</button>
      </main>
      <aside id="customization-options"><div>Customization:</div></aside>
    </div>`;

  buildCustomizationInputs(item, mc.querySelector("#customization-options"));

  mc.querySelector(".close-button").onclick = () => modal.classList.remove("show");
  modal.onclick = e => { if (e.target === modal) modal.classList.remove("show"); };

  mc.querySelector("#add-to-cart-btn").onclick = () => {
    const chosen = {};
    (item.customizations || []).forEach(group => {
      const sel = mc.querySelector(`input[name="${group.name}"]:checked`);
      if (sel) chosen[group.name] = sel.value;
    });
    addToCart(item, chosen);
    modal.classList.remove("show");
  };

  modal.classList.add("show");
}

function buildCustomizationInputs(item, aside) {
  if (!Array.isArray(item.customizations) || !item.customizations.length) {
    aside.insertAdjacentHTML("beforeend", "<p>No customization options.</p>");
    return;
  }

  item.customizations.forEach(group => {
    const g = document.createElement("div");
    g.className = "customization-group";
    g.innerHTML = `<h4>${group.groupLabel || "Customize"}</h4>`;
    group.options.forEach(opt => {
      g.insertAdjacentHTML(
        "beforeend",
        `<label class="customization-option">
           <input type="${group.type || "radio"}"
                  name="${group.name}"
                  value="${opt.value}" /> ${opt.label}
         </label><br />`
      );
    });
    aside.appendChild(g);
  });
}

/* ------------------------ Cart helper --------------------------------- */
function addToCart(item, customizations = {}, quantity = 1) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push({
    id: Date.now(),
    name: item.name,
    price: item.price,
    image: item.image,
    quantity,
    customizations,
    totalPrice: item.price * quantity * 1.12 // keep tax logic
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${item.name} added to cart!`);
}




