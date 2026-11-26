import { PRODUCTS } from "./products.js";
import { addCartLine, readCart, writeCart } from "./cart-store.js";
import { readFavorites, writeFavorites } from "./favorites.js";

const params = new URLSearchParams(window.location.search);
const product = PRODUCTS[params.get("id")];
const detail = document.querySelector("#product-detail");
const error = document.querySelector("#product-error");
const stickyBar = document.querySelector("#mobile-sticky-bar");

if (!product) {
  detail.hidden = true;
  if (stickyBar) stickyBar.hidden = true;
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

  const oldPriceEl = document.querySelector("#product-old-price");
  const discountEl = document.querySelector("#product-discount");
  if (product.oldPrice && product.oldPrice > product.price) {
    const pct = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    if (oldPriceEl) {
      oldPriceEl.textContent = cfa.format(product.oldPrice);
      oldPriceEl.hidden = false;
    }
    if (discountEl) {
      discountEl.textContent = `-${pct}%`;
      discountEl.hidden = false;
    }
    const stickyAddBtn = document.querySelector("#sticky-add-button");
    if (stickyAddBtn) stickyAddBtn.textContent = `-${pct}% ! AJOUTER AU PANIER`;
  }

  // Favorites synced between desktop & mobile sticky bar
  const favoriteButtons = [
    document.querySelector("#favorite-product"),
    document.querySelector("#sticky-favorite-product")
  ].filter(Boolean);
  const favorites = readFavorites(PRODUCTS);

  const updateFavoriteButtons = () => {
    const active = favorites.has(product.id);
    favoriteButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(active));
      btn.textContent = active ? "♥" : "♡";
      btn.setAttribute("aria-label", active ? "Retirer des favoris" : "Ajouter aux favoris");
    });
  };
  updateFavoriteButtons();

  favoriteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const wasFavorite = favorites.has(product.id);
      if (wasFavorite) favorites.delete(product.id);
      else favorites.add(product.id);
      if (!writeFavorites(favorites)) {
        if (wasFavorite) favorites.add(product.id);
        else favorites.delete(product.id);
        document.querySelector("#product-status").textContent = "Les favoris n’ont pas pu être sauvegardés sur cet appareil.";
        return;
      }
      updateFavoriteButtons();
    });
  });

  // Swipeable Image Carousel (Front view first, swipe left/right + arrows + dots + thumbs)
  const visual = document.querySelector("#product-visual");
  const counterEl = document.querySelector("#gallery-counter");
  const prevBtn = document.querySelector("#gallery-prev");
  const nextBtn = document.querySelector("#gallery-next");
  const dotsWrap = document.querySelector("#gallery-dots");
  const thumbs = document.querySelector("#product-thumbs");

  const gallery = product.images?.length ? product.images : [product.image];
  let currentIndex = 0;

  const isPhoto = !gallery[0].endsWith(".svg");
  if (isPhoto) {
    visual.classList.add("is-photo");
    visual.style.background = product.color || "#ffffff";
  } else {
    visual.style.backgroundColor = product.color || "#ffffff";
  }

  const art = document.createElement("img");
  art.className = `product-art ${product.symbol}`;
  art.src = `../assets/images/${gallery[0]}`;
  art.alt = `${product.name} — ${product.detail}`;
  art.draggable = false;
  visual.prepend(art);

  function showSlide(nextIdx) {
    currentIndex = ((nextIdx % gallery.length) + gallery.length) % gallery.length;
    art.src = `../assets/images/${gallery[currentIndex]}`;
    art.classList.remove("is-switching");
    void art.offsetWidth;
    art.classList.add("is-switching");

    if (counterEl) counterEl.textContent = `${currentIndex + 1}/${gallery.length}`;

    if (dotsWrap) {
      dotsWrap.querySelectorAll(".gallery-dot").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentIndex);
      });
    }
    if (thumbs) {
      thumbs.querySelectorAll(".product-thumb").forEach((other, i) => {
        const active = i === currentIndex;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
    }
  }

  if (gallery.length > 1) {
    if (prevBtn) {
      prevBtn.hidden = false;
      prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.hidden = false;
      nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));
    }

    if (dotsWrap) {
      gallery.forEach((_, idx) => {
        const dot = document.createElement("span");
        dot.className = `gallery-dot${idx === 0 ? " is-active" : ""}`;
        dotsWrap.append(dot);
      });
    }

    // Touch & pointer swipe directly on the main product image
    let startX = 0;
    let isSwiping = false;
    visual.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;
      startX = event.clientX;
      isSwiping = true;
    });
    visual.addEventListener("pointerup", (event) => {
      if (!isSwiping) return;
      isSwiping = false;
      const diff = event.clientX - startX;
      if (Math.abs(diff) > 36) {
        showSlide(diff < 0 ? currentIndex + 1 : currentIndex - 1);
      }
    });
    visual.addEventListener("pointercancel", () => { isSwiping = false; });

    if (thumbs) {
      thumbs.hidden = false;
      gallery.forEach((src, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `product-thumb${index === 0 ? " is-active" : ""}`;
        btn.style.background = product.color || "#ffffff";
        btn.setAttribute("aria-label", `Vue ${index + 1} de ${product.name}`);
        btn.setAttribute("aria-pressed", String(index === 0));
        const img = document.createElement("img");
        img.src = `../assets/images/${src}`;
        img.alt = "";
        btn.append(img);
        btn.addEventListener("click", () => showSlide(index));
        thumbs.append(btn);
      });
    }
  }
  showSlide(0);

  // Interactive Color Swatches
  const colorOptions = document.querySelector("#product-colors");
  const selectedColorName = document.querySelector("#selected-color-name");
  let activeColor = product.colors[0]?.name || "";

  const selectColor = (color, index) => {
    activeColor = color.name;
    if (selectedColorName) selectedColorName.textContent = color.name;
    if (color.bg) visual.style.backgroundColor = color.bg;
    if (color.image) {
      art.src = `../assets/images/${color.image}`;
    }
    colorOptions.querySelectorAll(".swatch-btn").forEach((b, i) => {
      const isSelected = i === index;
      b.classList.toggle("is-active", isSelected);
      b.setAttribute("aria-pressed", String(isSelected));
    });
  };

  product.colors.forEach((color, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `swatch-btn${index === 0 ? " is-active" : ""}`;
    btn.setAttribute("aria-label", `Couleur ${color.name}`);
    btn.setAttribute("aria-pressed", String(index === 0));
    btn.title = color.name;

    const dot = document.createElement("span");
    dot.className = "swatch-fill";
    dot.style.backgroundColor = color.value;
    btn.append(dot);

    btn.addEventListener("click", () => selectColor(color, index));
    colorOptions.append(btn);
  });

  if (product.colors[0]) selectColor(product.colors[0], 0);

  // Interactive Size Pill Buttons (XS / S / M / L / XL)
  const sizeGrid = document.querySelector("#product-sizes");
  const selectedSizeName = document.querySelector("#selected-size-name");
  let activeSize = product.sizes[0] || "M";

  const selectSize = (size) => {
    activeSize = size;
    if (selectedSizeName) selectedSizeName.textContent = size;
    sizeGrid.querySelectorAll(".size-pill").forEach((pill) => {
      const isSelected = pill.dataset.size === size;
      pill.classList.toggle("is-active", isSelected);
      pill.setAttribute("aria-pressed", String(isSelected));
    });
  };

  product.sizes.forEach((size) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "size-pill";
    pill.dataset.size = size;
    pill.textContent = size;
    pill.setAttribute("aria-pressed", "false");
    pill.addEventListener("click", () => selectSize(size));
    sizeGrid.append(pill);
  });
  selectSize(activeSize);

  const submitAddToCart = () => {
    const status = document.querySelector("#product-status");
    if (!activeColor || !activeSize) {
      status.textContent = "Choisissez une taille et une couleur.";
      return;
    }

    const cart = readCart(PRODUCTS);
    addCartLine(cart, product, activeSize, activeColor);
    if (!writeCart(cart)) {
      status.textContent = "Le panier n’a pas pu être sauvegardé. Réessayez avant de quitter cette page.";
      return;
    }

    window.location.href = "panier.html";
  };

  document.querySelector("#product-form").addEventListener("submit", (event) => {
    event.preventDefault();
    submitAddToCart();
  });

  document.querySelector("#sticky-add-button")?.addEventListener("click", submitAddToCart);
}
