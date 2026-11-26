import { PRODUCTS, CATEGORY_META, CATEGORY_ORDER } from "./products.js";
import { readFavorites, writeFavorites } from "./favorites.js";

const collection = document.body.dataset.collection;
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#catalog-search");
const categorySelect = document.querySelector("#category-filter");
const categoryTabs = document.querySelector("#category-tabs");
const favoritesButton = document.querySelector("#show-favorites");
const favoriteCount = document.querySelector("#favorite-count");
const resultCount = document.querySelector("#filter-count");
const emptyState = document.querySelector("#product-empty");

const currency = new Intl.NumberFormat("fr-CI", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0
});

const favorites = readFavorites(PRODUCTS);
let favoritesOnly = false;
let activeCategory = "all";

const visualClasses = ["visual-stone", "visual-fog", "visual-slate", "visual-ash"];

/**
 * Live BlackMoneyStacks-style promo countdown timer (H / MIN / SEC).
 */
function initPromoCountdown() {
  const hoursEl = document.querySelector("#countdown-hours");
  const minsEl = document.querySelector("#countdown-mins");
  const secsEl = document.querySelector("#countdown-secs");
  if (!hoursEl || !minsEl || !secsEl) return;

  const storageKey = "yodo_drop_deadline_v1";
  let deadline = Number(window.localStorage?.getItem(storageKey) || 0);
  if (!deadline || deadline <= Date.now()) {
    deadline = Date.now() + (21 * 3600 + 17 * 60 + 45) * 1000;
    try {
      window.localStorage?.setItem(storageKey, String(deadline));
    } catch {}
  }

  const tick = () => {
    let remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
    if (remaining === 0) {
      deadline = Date.now() + 24 * 3600 * 1000;
      remaining = 24 * 3600;
    }
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    hoursEl.textContent = String(h).padStart(2, "0");
    minsEl.textContent = String(m).padStart(2, "0");
    secsEl.textContent = String(s).padStart(2, "0");
  };

  tick();
  window.setInterval(tick, 1000);
}

function createProductCard(product, index) {
  const card = document.createElement("article");
  card.className = "product-card bms-card";

  const isPhoto = !product.image.endsWith(".svg");
  const visual = document.createElement("a");
  visual.href = `produit.html?id=${encodeURIComponent(product.id)}`;
  visual.className = `product-visual ${visualClasses[index % visualClasses.length]}${isPhoto ? " is-photo" : ""}`;
  visual.style.backgroundColor = product.color;
  visual.setAttribute("aria-label", `Voir ${product.name}`);

  if (product.badge) {
    const tag = document.createElement("span");
    tag.className = "product-tag bms-pill";
    tag.textContent = product.badge;
    visual.append(tag);
  }

  const favorite = document.createElement("button");
  favorite.className = "favorite-button";
  favorite.type = "button";
  favorite.dataset.favorite = product.id;
  favorite.setAttribute("aria-pressed", String(favorites.has(product.id)));
  favorite.setAttribute("aria-label", `${favorites.has(product.id) ? "Retirer" : "Ajouter"} ${product.name} ${favorites.has(product.id) ? "des" : "aux"} favoris`);
  favorite.textContent = favorites.has(product.id) ? "♥" : "♡";

  const model = document.createElement("div");
  model.className = "product-3d";
  const art = document.createElement("img");
  art.setAttribute("class", "product-art");
  art.src = `../assets/images/${product.image}`;
  art.alt = `${product.name} — ${product.detail}`;
  art.loading = "lazy";
  model.append(art);
  visual.append(model);

  const visualWrap = document.createElement("div");
  visualWrap.className = "bms-visual-wrap";
  visualWrap.append(visual, favorite);

  const info = document.createElement("a");
  info.className = "bms-info";
  info.href = `produit.html?id=${encodeURIComponent(product.id)}`;

  const name = document.createElement("h3");
  name.textContent = product.name;

  const prices = document.createElement("div");
  prices.className = "bms-price-row";
  if (product.oldPrice && product.oldPrice > product.price) {
    const oldP = document.createElement("s");
    oldP.className = "bms-old-price";
    oldP.textContent = currency.format(product.oldPrice);
    prices.append(oldP);
  }
  const currentP = document.createElement("span");
  currentP.className = "bms-current-price";
  currentP.textContent = currency.format(product.price);
  prices.append(currentP);

  if (product.colors?.length > 1) {
    const dots = document.createElement("div");
    dots.className = "bms-swatch-preview";
    product.colors.slice(0, 4).forEach((c) => {
      const dot = document.createElement("span");
      dot.className = "bms-dot";
      dot.style.backgroundColor = c.value;
      dot.title = c.name;
      dots.append(dot);
    });
    info.append(name, prices, dots);
  } else {
    info.append(name, prices);
  }

  card.append(visualWrap, info);
  return card;
}

function getCollectionProducts() {
  return Object.values(PRODUCTS).filter((product) =>
    collection === "all"
      || (collection === "streetwear" ? product.streetwear : product.audiences.includes(collection))
  );
}

function getVisibleProducts() {
  const query = (searchInput?.value || "").trim().toLocaleLowerCase("fr");
  const category = activeCategory;
  return getCollectionProducts().filter((product) => {
    const matchesCategory = category === "all"
      || product.category === category
      || (category === "promo" && Boolean(product.oldPrice));
    const matchesSearch = `${product.name} ${product.detail} ${product.category}`
      .toLocaleLowerCase("fr")
      .includes(query);
    return matchesCategory && matchesSearch
      && (!favoritesOnly || favorites.has(product.id));
  });
}

function updateTabCounts() {
  if (!categoryTabs) return;
  const base = getCollectionProducts();
  const counts = {
    all: base.length,
    tshirt: base.filter((p) => p.category === "tshirt").length,
    longsleeve: base.filter((p) => p.category === "longsleeve").length,
    promo: base.filter((p) => Boolean(p.oldPrice)).length
  };
  const labels = {
    all: "TOUT VOIR",
    tshirt: "T-SHIRTS",
    longsleeve: "MANCHES LONGUES",
    promo: "PROMO"
  };
  categoryTabs.querySelectorAll("[data-category]").forEach((tab) => {
    const cat = tab.dataset.category;
    if (labels[cat] !== undefined && counts[cat] !== undefined) {
      tab.textContent = `${labels[cat]} (${counts[cat]})`;
    }
  });
}

function syncCategoryUI() {
  if (categorySelect && categorySelect.value !== activeCategory) {
    categorySelect.value = activeCategory;
  }
  if (categoryTabs) {
    categoryTabs.querySelectorAll("[data-category]").forEach((tab) => {
      const active = !favoritesOnly && tab.dataset.category === activeCategory;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  }
}

function renderGroupedSections(visibleProducts) {
  productGrid.classList.add("is-grouped");
  const fragments = [];

  CATEGORY_ORDER.forEach((catId) => {
    const items = visibleProducts.filter((p) => p.category === catId);
    if (!items.length) return;

    const meta = CATEGORY_META[catId] || { label: catId, kicker: "" };
    const section = document.createElement("section");
    section.className = "catalog-category-section";
    section.setAttribute("aria-label", meta.label);

    const header = document.createElement("div");
    header.className = "catalog-category-header";
    const titleWrap = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.textContent = meta.label;
    titleWrap.append(h2);
    if (meta.kicker) {
      const sub = document.createElement("p");
      sub.textContent = meta.kicker;
      titleWrap.append(sub);
    }

    const metaRight = document.createElement("div");
    metaRight.className = "catalog-category-actions";
    const countBadge = document.createElement("span");
    countBadge.className = "catalog-category-count";
    countBadge.textContent = `${items.length} PIÈCE${items.length === 1 ? "" : "S"}`;
    const filterLink = document.createElement("button");
    filterLink.type = "button";
    filterLink.className = "catalog-category-only";
    filterLink.textContent = "Voir uniquement →";
    filterLink.addEventListener("click", () => {
      favoritesOnly = false;
      favoritesButton?.setAttribute("aria-pressed", "false");
      favoritesButton?.classList.remove("is-active");
      activeCategory = catId;
      render();
      categoryTabs?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    metaRight.append(countBadge, filterLink);

    header.append(titleWrap, metaRight);

    const grid = document.createElement("div");
    grid.className = "product-grid bms-grid";
    grid.append(...items.map(createProductCard));

    section.append(header, grid);
    fragments.push(section);
  });

  productGrid.replaceChildren(...fragments);
}

function render() {
  const visibleProducts = getVisibleProducts();
  updateTabCounts();

  const shouldGroup = !favoritesOnly && activeCategory === "all";
  if (shouldGroup && visibleProducts.length > 0) {
    renderGroupedSections(visibleProducts);
  } else {
    productGrid.classList.remove("is-grouped");
    productGrid.replaceChildren(...visibleProducts.map(createProductCard));
  }

  if (favoriteCount) favoriteCount.textContent = String(favorites.size);
  resultCount.textContent = `${visibleProducts.length} PRODUIT${visibleProducts.length === 1 ? "" : "S"}`;
  emptyState.hidden = visibleProducts.length > 0;
  syncCategoryUI();
}

searchInput?.addEventListener("input", render);

categorySelect?.addEventListener("change", () => {
  favoritesOnly = false;
  favoritesButton?.setAttribute("aria-pressed", "false");
  favoritesButton?.classList.remove("is-active");
  activeCategory = categorySelect.value;
  render();
});

categoryTabs?.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-category]");
  if (!tab) return;
  favoritesOnly = false;
  favoritesButton?.setAttribute("aria-pressed", "false");
  favoritesButton?.classList.remove("is-active");
  activeCategory = tab.dataset.category;
  render();
});

favoritesButton?.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  favoritesButton.setAttribute("aria-pressed", String(favoritesOnly));
  favoritesButton.classList.toggle("is-active", favoritesOnly);
  render();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();

  const productId = button.dataset.favorite;
  const wasFavorite = favorites.has(productId);
  if (wasFavorite) favorites.delete(productId);
  else favorites.add(productId);

  if (!writeFavorites(favorites)) {
    if (wasFavorite) favorites.add(productId);
    else favorites.delete(productId);
    resultCount.textContent = "Les favoris n’ont pas pu être sauvegardés sur cet appareil.";
    return;
  }
  render();
});

initPromoCountdown();
render();
