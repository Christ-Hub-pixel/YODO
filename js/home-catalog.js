import { PRODUCTS, CATEGORY_META, CATEGORY_ORDER } from "./products.js";

const gridRoot = document.querySelector("#home-product-grid");
const tabs = document.querySelector("#home-category-tabs");

if (gridRoot) {
  const currency = new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0
  });

  let activeCategory = "all";

  function createCard(product) {
    const card = document.createElement("article");
    card.className = "product-card bms-card";

    const visualWrap = document.createElement("div");
    visualWrap.className = "bms-visual-wrap";

    const visual = document.createElement("a");
    visual.href = `pages/produit.html?id=${encodeURIComponent(product.id)}`;
    visual.className = "product-visual is-photo";
    visual.style.backgroundColor = product.color || "#ffffff";
    visual.setAttribute("aria-label", `Voir ${product.name}`);

    if (product.badge) {
      const tag = document.createElement("span");
      tag.className = "product-tag bms-pill";
      tag.textContent = product.badge;
      visual.append(tag);
    }

    const model = document.createElement("div");
    model.className = "product-3d";
    const img = document.createElement("img");
    img.className = "product-art";
    img.src = `assets/images/${product.image}`;
    img.alt = `${product.name} — ${product.detail}`;
    img.loading = "lazy";
    model.append(img);
    visual.append(model);
    visualWrap.append(visual);

    const info = document.createElement("a");
    info.className = "bms-info";
    info.href = `pages/produit.html?id=${encodeURIComponent(product.id)}`;

    const h3 = document.createElement("h3");
    h3.textContent = product.name;

    const prices = document.createElement("div");
    prices.className = "bms-price-row";
    if (product.oldPrice && product.oldPrice > product.price) {
      const oldP = document.createElement("s");
      oldP.className = "bms-old-price";
      oldP.textContent = currency.format(product.oldPrice);
      prices.append(oldP);
    }
    const price = document.createElement("span");
    price.className = "bms-current-price";
    price.textContent = currency.format(product.price);
    prices.append(price);

    info.append(h3, prices);
    card.append(visualWrap, info);
    return card;
  }

  function updateCounts() {
    if (!tabs) return;
    const all = Object.values(PRODUCTS);
    const map = {
      all: `TOUT VOIR (${all.length})`,
      tshirt: `T-SHIRTS (${all.filter((p) => p.category === "tshirt").length})`,
      longsleeve: `MANCHES LONGUES (${all.filter((p) => p.category === "longsleeve").length})`
    };
    tabs.querySelectorAll("[data-category]").forEach((tab) => {
      const cat = tab.dataset.category;
      if (map[cat]) tab.textContent = map[cat];
      const isAct = cat === activeCategory;
      tab.classList.toggle("is-active", isAct);
      tab.setAttribute("aria-selected", String(isAct));
    });
  }

  function render() {
    const all = Object.values(PRODUCTS);
    updateCounts();

    if (activeCategory === "all") {
      gridRoot.classList.add("is-grouped");
      const sections = [];
      CATEGORY_ORDER.forEach((catId) => {
        const items = all.filter((p) => p.category === catId);
        if (!items.length) return;
        const meta = CATEGORY_META[catId] || { label: catId, kicker: "" };

        const section = document.createElement("section");
        section.className = "catalog-category-section";

        const header = document.createElement("div");
        header.className = "catalog-category-header";
        const titleWrap = document.createElement("div");
        const h2 = document.createElement("h2");
        h2.textContent = meta.label;
        titleWrap.append(h2);
        if (meta.kicker) {
          const p = document.createElement("p");
          p.textContent = meta.kicker;
          titleWrap.append(p);
        }

        const right = document.createElement("div");
        right.className = "catalog-category-actions";
        const count = document.createElement("span");
        count.className = "catalog-category-count";
        count.textContent = `${items.length} PIÈCE${items.length === 1 ? "" : "S"}`;
        right.append(count);
        header.append(titleWrap, right);

        const subGrid = document.createElement("div");
        subGrid.className = "product-grid bms-grid";
        subGrid.append(...items.map(createCard));

        section.append(header, subGrid);
        sections.push(section);
      });
      gridRoot.replaceChildren(...sections);
    } else {
      gridRoot.classList.remove("is-grouped");
      const items = all.filter((p) => p.category === activeCategory);
      gridRoot.replaceChildren(...items.map(createCard));
    }
  }

  tabs?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-category]");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    render();
  });

  render();
}
