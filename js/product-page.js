import { PRODUCTS } from "./products.js";
import { addCartLine, readCart, writeCart } from "./cart-store.js";
import { readFavorites, writeFavorites } from "./favorites.js";

const params = new URLSearchParams(window.location.search);
const product = PRODUCTS[params.get("id")];
const detail = document.querySelector("#product-detail");
const error = document.querySelector("#product-error");

if (!product) {
  detail.hidden = true;
  error.hidden = false;
} else {
  const cfa = new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0
  });
  document.title = `${product.name} - YODO`;
  document.querySelector("#product-title").textContent = product.name;
  document.querySelector("#product-price").textContent = cfa.format(product.price);
  document.querySelector("#product-description").textContent = product.detail;
  const favoriteButton = document.querySelector("#favorite-product");
  const favorites = readFavorites(PRODUCTS);
  const updateFavoriteButton = () => {
    const active = favorites.has(product.id);
    favoriteButton.setAttribute("aria-pressed", String(active));
    favoriteButton.textContent = active ? "♥ Dans vos favoris" : "♡ Ajouter aux favoris";
  };
  updateFavoriteButton();
  favoriteButton.addEventListener("click", () => {
    const wasFavorite = favorites.has(product.id);
    if (wasFavorite) favorites.delete(product.id);
    else favorites.add(product.id);
    if (!writeFavorites(favorites)) {
      if (wasFavorite) favorites.add(product.id);
      else favorites.delete(product.id);
      document.querySelector("#product-status").textContent = "Les favoris n’ont pas pu être sauvegardés sur cet appareil.";
      return;
    }
    updateFavoriteButton();
  });

  const visual = document.querySelector("#product-visual");
  const isPhoto = !product.image.endsWith(".svg");
  if (isPhoto) {
    visual.classList.add("is-photo");
    visual.style.background = product.color;
  } else {
    visual.style.backgroundColor = product.color;
  }
  const art = document.createElement("img");
  art.className = `product-art ${product.symbol}`;
  art.src = `../assets/images/${product.image}`;
  art.alt = `${product.name} — ${product.detail}`;
  visual.append(art);

  const thumbs = document.querySelector("#product-thumbs");
  const gallery = product.images?.length ? product.images : [product.image];
  if (thumbs && gallery.length > 1) {
    thumbs.hidden = false;
    gallery.forEach((src, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `product-thumb${index === 0 ? " is-active" : ""}`;
      btn.style.background = product.color;
      btn.setAttribute("aria-label", `Vue ${index + 1} de ${product.name}`);
      btn.setAttribute("aria-pressed", String(index === 0));
      const img = document.createElement("img");
      img.src = `../assets/images/${src}`;
      img.alt = "";
      btn.append(img);
      btn.addEventListener("click", () => {
        art.src = `../assets/images/${src}`;
        thumbs.querySelectorAll(".product-thumb").forEach((other, i) => {
          const active = i === index;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });
      });
      thumbs.append(btn);
    });
  }

  const sizeSelect = document.querySelector("#product-size");
  product.sizes.forEach((size) => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeSelect.append(option);
  });

  const colorOptions = document.querySelector("#product-colors");
  product.colors.forEach((color, index) => {
    const label = document.createElement("label");
    label.className = "color-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "color";
    input.value = color.name;
    input.required = true;
    input.checked = index === 0;
    const swatch = document.createElement("span");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color.value;
    const text = document.createElement("span");
    text.textContent = color.name;
    label.append(input, swatch, text);
    colorOptions.append(label);
  });

  document.querySelector("#product-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const color = colorOptions.querySelector('input[name="color"]:checked')?.value;
    const status = document.querySelector("#product-status");
    if (!color || !sizeSelect.value) {
      status.textContent = "Choisissez une taille et une couleur.";
      return;
    }

    const cart = readCart(PRODUCTS);
    addCartLine(cart, product, sizeSelect.value, color);
    if (!writeCart(cart)) {
      status.textContent = "Le panier n’a pas pu être sauvegardé. Réessayez avant de quitter cette page.";
      return;
    }

    window.location.href = "panier.html";
  });
}
