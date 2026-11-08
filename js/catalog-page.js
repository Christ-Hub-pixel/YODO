import { PRODUCTS } from "./products.js";
import { readFavorites, writeFavorites } from "./favorites.js";

const collection = document.body.dataset.collection;
const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#catalog-search");
const categorySelect = document.querySelector("#category-filter");
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

const visualClasses = ["visual-stone", "visual-fog", "visual-slate", "visual-ash"];

function createProductCard(product, index) {
  const card = document.createElement("article");
  card.className = "product-card";

  const visual = document.createElement("div");
  visual.className = `product-visual ${visualClasses[index % visualClasses.length]}`;
  visual.style.backgroundColor = product.color;

  const tag = document.createElement("span");
  tag.className = "product-tag";
  tag.textContent = "Article démo";
  const number = document.createElement("span");
  number.className = "visual-number";
  number.textContent = `Y-${String(index + 1).padStart(2, "0")}`;

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
  art.alt = `Illustration de démonstration : ${product.name}`;
  model.append(art);
  visual.append(tag, number, favorite, model);

  const info = document.createElement("div");
  info.className = "product-info";
  const copy = document.createElement("div");
  const name = document.createElement("h3");
  name.textContent = product.name;
  const detail = document.createElement("p");
  detail.textContent = product.detail;
  copy.append(name, detail);
  const price = document.createElement("span");
  price.textContent = currency.format(product.price);
  info.append(copy, price);

  const link = document.createElement("a");
  link.className = "product-detail-link";
  link.href = `produit.html?id=${encodeURIComponent(product.id)}`;
  link.append(document.createTextNode("Choisir les options "));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(arrow);

  card.append(visual, info, link);
  return card;
}

function getVisibleProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("fr");
  const category = categorySelect.value;
  return Object.values(PRODUCTS).filter((product) => {
    const matchesCollection = collection === "all"
      || (collection === "streetwear" ? product.streetwear : product.audiences.includes(collection));
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch = `${product.name} ${product.detail} ${product.category}`
      .toLocaleLowerCase("fr")
      .includes(query);
    return matchesCollection && matchesCategory && matchesSearch
      && (!favoritesOnly || favorites.has(product.id));
  });
}

function render() {
  const visibleProducts = getVisibleProducts();
  productGrid.replaceChildren(...visibleProducts.map(createProductCard));
  favoriteCount.textContent = String(favorites.size);
  resultCount.textContent = `${visibleProducts.length} article${visibleProducts.length === 1 ? "" : "s"} de démonstration`;
  emptyState.hidden = visibleProducts.length > 0;
}

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
favoritesButton.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  favoritesButton.setAttribute("aria-pressed", String(favoritesOnly));
  favoritesButton.classList.toggle("is-active", favoritesOnly);
  render();
});
productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite]");
  if (!button) return;

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

render();
